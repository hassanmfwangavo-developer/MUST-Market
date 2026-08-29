import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const POINTS_PER_1000_TSH = 1;
export const REFERRAL_INVITER_BONUS = 50;
export const REFERRAL_INVITEE_BONUS = 10;

type AdminClient = SupabaseClient<Database>;

export type OrderRewardsResult = {
  pointsEarned: number;
  streak: number;
  streakIncreased: boolean;
  referralBonusAwarded: boolean;
};

function utcDay(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/**
 * Awards order points, bumps the daily streak and settles any pending
 * referral bonus. Idempotent: an order marked reward_points_awarded is a no-op.
 * Must be called with the service-role client (profile reward columns are
 * trigger-protected against direct user edits).
 */
export async function applyOrderRewards(
  admin: AdminClient,
  userId: string,
  orderId: string,
): Promise<OrderRewardsResult> {
  const none: OrderRewardsResult = {
    pointsEarned: 0,
    streak: 0,
    streakIncreased: false,
    referralBonusAwarded: false,
  };

  // Atomically claim the right to award this order.
  const { data: claimedRows } = await admin
    .from("food_orders")
    .update({ reward_points_awarded: true })
    .eq("id", orderId)
    .eq("user_id", userId)
    .eq("reward_points_awarded", false)
    .select("total_tsh");
  const order = claimedRows?.[0];
  if (!order) return none; // already awarded or not this user's order

  const pointsEarned = Math.floor(order.total_tsh / 1000) * POINTS_PER_1000_TSH;

  // ---- Streak ----
  const { data: profile } = await admin
    .from("profiles")
    .select("current_streak, reward_points, last_order_date")
    .eq("id", userId)
    .maybeSingle();

  const today = utcDay();
  const yesterday = utcDay(-1);
  const prevStreak = profile?.current_streak ?? 0;
  const lastDate = profile?.last_order_date ?? null;

  let streak = prevStreak;
  let streakIncreased = false;
  if (lastDate === today) {
    streak = prevStreak; // already ordered today
  } else if (lastDate === yesterday) {
    streak = prevStreak + 1;
    streakIncreased = true;
  } else {
    streak = 1;
    streakIncreased = prevStreak === 0;
  }

  const newPoints = (profile?.reward_points ?? 0) + pointsEarned;
  await admin
    .from("profiles")
    .update({
      current_streak: streak,
      reward_points: newPoints,
      last_order_date: today,
    })
    .eq("id", userId);

  // ---- Referral first-order bonus ----
  let referralBonusAwarded = false;
  const { data: referral } = await admin
    .from("referrals")
    .select("id, inviter_id")
    .eq("invited_id", userId)
    .eq("order_counted", false)
    .maybeSingle();

  if (referral) {
    const { count } = await admin
      .from("food_orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) <= 1) {
      const { data: inviter } = await admin
        .from("profiles")
        .select("reward_points")
        .eq("id", referral.inviter_id)
        .maybeSingle();
      await admin
        .from("profiles")
        .update({ reward_points: (inviter?.reward_points ?? 0) + REFERRAL_INVITER_BONUS })
        .eq("id", referral.inviter_id);
      await admin
        .from("profiles")
        .update({ reward_points: newPoints + REFERRAL_INVITEE_BONUS })
        .eq("id", userId);
      await admin
        .from("referrals")
        .update({ order_counted: true })
        .eq("id", referral.id);
      referralBonusAwarded = true;
    } else {
      // Referred user had already ordered before claiming — close out the
      // referral without a bonus so it doesn't stay pending forever.
      await admin
        .from("referrals")
        .update({ order_counted: true })
        .eq("id", referral.id);
    }
  }

  return { pointsEarned, streak, streakIncreased, referralBonusAwarded };
}

/**
 * Records who invited a user. Only the first claim sticks; self-referrals
 * and duplicate claims are ignored.
 */
export async function claimReferralForUser(
  admin: AdminClient,
  userId: string,
  inviterId: string,
): Promise<{ claimed: boolean }> {
  if (!inviterId || inviterId === userId) return { claimed: false };
  // Loose UUID shape check — the value comes from a URL param.
  if (!/^[0-9a-f-]{36}$/i.test(inviterId)) return { claimed: false };

  const { data: profile } = await admin
    .from("profiles")
    .select("referred_by")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.referred_by) return { claimed: false };

  // Inviter must be a real user.
  const { data: inviter } = await admin
    .from("profiles")
    .select("id")
    .eq("id", inviterId)
    .maybeSingle();
  if (!inviter) return { claimed: false };

  const { error: refError } = await admin.from("referrals").insert({
    inviter_id: inviterId,
    invited_id: userId,
  });
  if (refError) return { claimed: false }; // e.g. duplicate invited_id

  await admin.from("profiles").update({ referred_by: inviterId }).eq("id", userId);
  return { claimed: true };
}
