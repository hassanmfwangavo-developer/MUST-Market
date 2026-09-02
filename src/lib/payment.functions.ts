import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function validateOrderId(input: { orderId: string }) {
  if (!input || typeof input.orderId !== "string" || !/^[0-9a-f-]{36}$/i.test(input.orderId)) {
    throw new Error("Valid orderId is required");
  }
  return { orderId: input.orderId };
}

export const startPendingPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateOrderId)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { startPaymentForOrder } = await import("@/lib/payment.server");
    return startPaymentForOrder(supabaseAdmin, context.userId, data.orderId);
  });

export const pollOrderPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateOrderId)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { checkPaymentForOrder } = await import("@/lib/payment.server");
    return checkPaymentForOrder(supabaseAdmin, context.userId, data.orderId);
  });
