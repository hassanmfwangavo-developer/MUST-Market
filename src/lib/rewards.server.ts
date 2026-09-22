import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/** Flat reward for every completed order. */
export const POINTS_PER_ORDER = 100;
export const REFERRAL_INVITER_BONUS = 50;
export const REFERRAL_INVITEE_BONUS = 10;

type AdminClient = SupabaseClient<Database>;

/** Referrals needed per free-soda voucher. */
export const REFERRALS_PER_VOUCHER = 3;

export type OrderRewardsResult = {
  pointsEarned: number;
  streak: number;
  streakIncreased: boolean;
  referralBonusAwarded: boolean;
  voucherIssued: boolean;
};

function voucherCode(): string {
  return `SODA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/** Issues a free-soda voucher for every 3rd successful referral. */
async function issueSodaVoucherIfEarned(
  admin: AdminClient,
  userId: string,
  referralCount: number,
): Promise<boolean> {
  if (referralCount <= 0 || referralCount % REFERRALS_PER_VOUCHER !== 0) return false;
  const { error } = await admin.from("user_vouchers").insert({
    user_id: userId,
    voucher_code: voucherCode(),
    discount_type: "free_soda",
  });
  if (error) {
    console.error("[Rewards] Voucher insert failed:", error.message);
    return false;
  }
  return true;
}

/**
 * Settles the referral that brought this user in, on their FIRST completed
 * order: the inviter gets bonus points, +1 referral_count and, every third
 * referral, a free-soda voucher. Idempotent via referrals.order_counted.
 */
async function settleReferralOnFirstOrder(
  admin: AdminClient,
  userId: string,
): Promise<{ bonusAwarded: boolean; voucherIssued: boolean }> {
  const { data: claimed } = await admin
    .from("referrals")
    .update({ order_counted: true })
    .eq("invited_id", userId)
    .eq("order_counted", false)
    .select("inviter_id");
  const inviterId = claimed?.[0]?.inviter_id;
  if (!inviterId) return { bonusAwarded: false, voucherIssued: false };

  const { data: inviter } = await admin
    .from("profiles")
    .select("reward_points, referral_count")
    .eq("id", inviterId)
    .maybeSingle();

  const nextCount = (inviter?.referral_count ?? 0) + 1;
  await admin
    .from("profiles")
    .update({
      reward_points: (inviter?.reward_points ?? 0) + REFERRAL_INVITER_BONUS,
      referral_count: nextCount,
    } as never)
    .eq("id", inviterId);

  const voucherIssued = await issueSodaVoucherIfEarned(admin, inviterId, nextCount);
  return { bonusAwarded: true, voucherIssued };
}

function utcDay(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/**
 * Daily login streak. Same day → unchanged, yesterday → +1, older/never → 1.
 * Uses the service-role client because reward columns are trigger-protected.
 */
export async function touchLoginStreakForUser(
  admin: AdminClient,
  userId: string,
): Promise<{ streak: number; increased: boolean }> {
  const { data: profile } = await admin
    .from("profiles")
    .select("current_streak, last_login_date")
    .eq("id", userId)
    .maybeSingle();

  const today = utcDay();
  const yesterday = utcDay(-1);
  const prev = profile?.current_streak ?? 0;
  const last = (profile as { last_login_date?: string | null } | null)?.last_login_date ?? null;

  if (last === today) return { streak: Math.max(prev, 1), increased: false };

  const streak = last === yesterday ? prev + 1 : 1;
  await admin
    .from("profiles")
    .update({ current_streak: streak, last_login_date: today } as never)
    .eq("id", userId);

  return { streak, increased: last === yesterday };
}

/**
 * Awards order points, bumps the daily streak and settles any pending
 * referral bonus. Idempotent: an order marked reward_points_awarded is a no-op.
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

  const pointsEarned = order.total_tsh > 0 ? POINTS_PER_ORDER : 0;

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

  // Referral bonuses are settled at sign-up time (see claimReferralForUser).
  return { pointsEarned, streak, streakIncreased, referralBonusAwarded: false };
}

/**
 * Records who invited a user (by referral code or inviter id), credits the
 * inviter with the referral bonus and welcome points for the invitee.
 * Only the first claim sticks; self-referrals and duplicates are ignored.
 */
export async function claimReferralForUser(
  admin: AdminClient,
  userId: string,
  rawRef: string,
): Promise<{ claimed: boolean }> {
  const ref = (rawRef ?? "").trim();
  if (!ref || ref === userId) return { claimed: false };
  if (!/^[0-9a-zA-Z-]{6,40}$/.test(ref)) return { claimed: false };

  const { data: profile } = await admin
    .from("profiles")
    .select("referred_by, reward_points")
    .eq("id", userId)
    .maybeSingle();
  if (!profile || profile.referred_by) return { claimed: false };

  const isUuid = /^[0-9a-f-]{36}$/i.test(ref);
  const { data: inviter } = await admin
    .from("profiles")
    .select("id, reward_points, referral_count")
    .eq(isUuid ? "id" : "referral_code", isUuid ? ref : ref.toUpperCase())
    .maybeSingle();
  if (!inviter || inviter.id === userId) return { claimed: false };

  const { error: refError } = await admin.from("referrals").insert({
    inviter_id: inviter.id,
    invited_id: userId,
    order_counted: true,
  });
  if (refError) return { claimed: false }; // e.g. duplicate invited_id

  await admin
    .from("profiles")
    .update({
      referred_by: inviter.id,
      reward_points: (profile.reward_points ?? 0) + REFERRAL_INVITEE_BONUS,
    })
    .eq("id", userId);

  const inv = inviter as { reward_points: number; referral_count?: number };
  await admin
    .from("profiles")
    .update({
      reward_points: (inv.reward_points ?? 0) + REFERRAL_INVITER_BONUS,
      referral_count: (inv.referral_count ?? 0) + 1,
    } as never)
    .eq("id", inviter.id);

  return { claimed: true };
}
