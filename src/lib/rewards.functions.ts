import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const completeOrderRewards = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderId: string }) => {
    if (!input || typeof input.orderId !== "string" || !input.orderId) {
      throw new Error("orderId is required");
    }
    return { orderId: input.orderId };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { applyOrderRewards } = await import("./rewards.server");
    return applyOrderRewards(supabaseAdmin, context.userId, data.orderId);
  });

export const claimReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { inviterId: string }) => {
    if (!input || typeof input.inviterId !== "string") {
      throw new Error("inviterId is required");
    }
    return { inviterId: input.inviterId };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { claimReferralForUser } = await import("./rewards.server");
    return claimReferralForUser(supabaseAdmin, context.userId, data.inviterId);
  });
