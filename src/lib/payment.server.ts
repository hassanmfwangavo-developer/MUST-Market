import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import { applyOrderRewards } from "@/lib/rewards.server";

type AdminClient = SupabaseClient<Database>;

type ProviderResponse = {
  status?: unknown;
  message?: unknown;
  data?: {
    order_id?: unknown;
    payment_status?: unknown;
    status?: unknown;
    amount?: unknown;
    currency?: unknown;
    reference?: unknown;
    transid?: unknown;
    channel?: unknown;
  };
  transaction?: {
    status?: unknown;
    amount?: unknown;
    reference?: unknown;
    transid?: unknown;
    channel?: unknown;
  };
};

export type PaymentResult = {
  state: "pending" | "success" | "failed" | "not_configured";
  providerOrderId?: string;
};

const SONIC_PESA_BASE_URL = "https://api.sonicpesa.com/api/v1";
const PROVIDER_FAILURE_STATUSES = new Set([
  "CANCELLED",
  "USERCANCELLED",
  "REJECTED",
  "FAILED",
  "ERROR",
  "EXPIRED",
]);

function providerConfig() {
  const apiKey = process.env.SONIC_PESA_API_KEY;
  const enabled = process.env.SONIC_PESA_ENABLED === "true";
  const usable = Boolean(apiKey && !apiKey.includes("PASTE_YOUR_") && enabled);
  return { apiKey, usable };
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asAmount(value: unknown): number | undefined {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isInteger(amount) && amount > 0 ? amount : undefined;
}

function providerStatus(body: ProviderResponse): string {
  return String(body.data?.payment_status ?? body.data?.status ?? body.transaction?.status ?? "")
    .toUpperCase()
    .replace("COMPLETED", "SUCCESS");
}

function providerOrderId(body: ProviderResponse): string | undefined {
  return asString(body.data?.order_id);
}

function providerReference(body: ProviderResponse): string | undefined {
  return asString(body.data?.reference ?? body.transaction?.reference);
}

function providerTransactionId(body: ProviderResponse): string | undefined {
  return asString(body.data?.transid ?? body.transaction?.transid);
}

async function sonicPesaRequest(
  path: string,
  body: Record<string, unknown>,
): Promise<ProviderResponse> {
  const { apiKey, usable } = providerConfig();
  if (!usable || !apiKey) throw new Error("Payment provider is not enabled");

  const response = await fetch(`${SONIC_PESA_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const payload = (await response.json().catch(() => ({}))) as ProviderResponse;
  if (!response.ok || payload.status === "error")
    throw new Error("Payment provider request failed");
  return payload;
}

async function setPaymentFailed(admin: AdminClient, paymentId: string) {
  await admin.from("payments").update({ status: "failed" }).eq("id", paymentId);
}

export async function startPaymentForOrder(
  admin: AdminClient,
  userId: string,
  orderId: string,
): Promise<PaymentResult> {
  const { data: order, error: orderError } = await admin
    .from("food_orders")
    .select("id, user_id, total_tsh, payment_status, customer_name, phone")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();
  if (orderError || !order) throw new Error("Order not found");
  if (order.payment_status === "success") {
    const { data: confirmedPayment } = await admin
      .from("payments")
      .select("id")
      .eq("food_order_id", orderId)
      .eq("provider", "sonic_pesa")
      .eq("status", "success")
      .eq("amount_tsh", order.total_tsh)
      .not("confirmed_at", "is", null)
      .maybeSingle();
    return confirmedPayment ? { state: "success" } : { state: "pending" };
  }

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .select("id, status, provider_order_id")
    .eq("food_order_id", orderId)
    .eq("provider", "sonic_pesa")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (paymentError || !payment) throw new Error("Payment record not found");

  if (payment.status === "pending" && payment.provider_order_id) {
    return { state: "pending", providerOrderId: payment.provider_order_id };
  }

  const { usable } = providerConfig();
  if (!usable) return { state: "not_configured" };

  await admin
    .from("payments")
    .update({
      status: "pending",
      provider_order_id: null,
      provider_reference: null,
      transaction_id: null,
      confirmed_at: null,
      webhook_event_id: null,
    })
    .eq("id", payment.id);
  await admin
    .from("food_orders")
    .update({ payment_status: "pending" })
    .eq("id", orderId)
    .eq("user_id", userId);

  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();
    const response = await sonicPesaRequest("/payment/create_order", {
      buyer_email: profile?.email ?? undefined,
      buyer_name: order.customer_name,
      buyer_phone: order.phone,
      amount: order.total_tsh,
      currency: "TZS",
    });
    const spOrderId = providerOrderId(response);
    if (!spOrderId) throw new Error("Payment provider returned no order ID");

    await admin
      .from("payments")
      .update({
        provider_order_id: spOrderId,
        provider_reference: providerReference(response) ?? null,
        transaction_id: providerTransactionId(response) ?? null,
        raw_provider_metadata: response as unknown as Json,
      })
      .eq("id", payment.id);
    return { state: "pending", providerOrderId: spOrderId };
  } catch (error) {
    await setPaymentFailed(admin, payment.id);
    throw error;
  }
}

export async function checkPaymentForOrder(
  admin: AdminClient,
  userId: string,
  orderId: string,
): Promise<PaymentResult> {
  const { data: order } = await admin
    .from("food_orders")
    .select("id, user_id, total_tsh, payment_status")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!order) throw new Error("Order not found");
  if (order.payment_status === "success") return { state: "success" };

  const { data: payment } = await admin
    .from("payments")
    .select("id, status, provider_order_id")
    .eq("food_order_id", orderId)
    .eq("provider", "sonic_pesa")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!payment) throw new Error("Payment record not found");
  if (payment.status === "failed" || payment.status === "cancelled") {
    return { state: "failed" };
  }
  if (!payment.provider_order_id) return { state: "pending" };
  if (!providerConfig().usable)
    return { state: "pending", providerOrderId: payment.provider_order_id };

  const response = await sonicPesaRequest("/payment/order_status", {
    order_id: payment.provider_order_id,
  });
  const returnedOrderId = providerOrderId(response);
  const amount = asAmount(response.data?.amount ?? response.transaction?.amount);
  const currency = asString(response.data?.currency);
  if (
    returnedOrderId !== payment.provider_order_id ||
    amount !== order.total_tsh ||
    currency !== "TZS"
  ) {
    throw new Error("Payment status did not match the order");
  }

  const status = providerStatus(response);
  if (status === "SUCCESS") {
    const reference = providerReference(response);
    const transactionId = providerTransactionId(response);
    if (!reference && !transactionId)
      throw new Error("Successful payment has no transaction reference");
    await confirmSuccessfulPayment(admin, {
      paymentId: payment.id,
      orderId,
      userId,
      amount,
      providerOrderId: payment.provider_order_id,
      reference,
      transactionId,
      metadata: response,
    });
    return { state: "success", providerOrderId: payment.provider_order_id };
  }
  if (PROVIDER_FAILURE_STATUSES.has(status)) {
    await admin
      .from("payments")
      .update({ status: "failed", raw_provider_metadata: response as unknown as Json })
      .eq("id", payment.id);
    await admin
      .from("food_orders")
      .update({ payment_status: "failed" })
      .eq("id", orderId)
      .eq("user_id", userId);
    return { state: "failed", providerOrderId: payment.provider_order_id };
  }
  return { state: "pending", providerOrderId: payment.provider_order_id };
}

async function confirmSuccessfulPayment(
  admin: AdminClient,
  input: {
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
    providerOrderId: string;
    reference?: string;
    transactionId?: string;
    metadata: ProviderResponse;
    webhookEventId?: string;
  },
) {
  const { error: paymentError } = await admin
    .from("payments")
    .update({
      status: "success",
      provider_order_id: input.providerOrderId,
      provider_reference: input.reference ?? null,
      transaction_id: input.transactionId ?? null,
      amount_tsh: input.amount,
      raw_provider_metadata: input.metadata as unknown as Json,
      webhook_event_id: input.webhookEventId ?? null,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", input.paymentId)
    .eq("amount_tsh", input.amount);
  if (paymentError) throw new Error("Could not record payment confirmation");

  const { error: orderError } = await admin
    .from("food_orders")
    .update({ payment_status: "success" })
    .eq("id", input.orderId)
    .eq("user_id", input.userId)
    .eq("total_tsh", input.amount);
  if (orderError) throw new Error("Could not mark order as paid");

  await applyOrderRewards(admin, input.userId, input.orderId);
}

export async function handleSonicPesaWebhook(
  admin: AdminClient,
  rawBytes: Uint8Array,
  signature: string | null,
): Promise<"ignored" | "processed"> {
  const secret = process.env.SONIC_PESA_WEBHOOK_SECRET;
  if (!secret || !signature || !(await verifySignature(rawBytes, signature, secret))) {
    throw new Error("Invalid webhook signature");
  }
  const rawBody = new TextDecoder().decode(rawBytes);
  const payload = JSON.parse(rawBody) as ProviderResponse & {
    event?: unknown;
    order_id?: unknown;
    amount?: unknown;
    currency?: unknown;
    reference?: unknown;
    transid?: unknown;
    channel?: unknown;
    payment_status?: unknown;
  };
  if (
    payload.event !== "payment.success" ||
    String(payload.status ?? "").toUpperCase() !== "SUCCESS"
  ) {
    return "ignored";
  }

  const eventId = await sha256(rawBytes);
  const providerOrderId = asString(payload.order_id);
  const amount = asAmount(payload.amount);
  const currency = asString(payload.currency);
  const transactionId = asString(payload.transid);
  const reference = asString(payload.reference);
  if (!providerOrderId || !amount || currency !== "TZS" || (!transactionId && !reference)) {
    throw new Error("Invalid payment.success payload");
  }

  const { data: existingEvent } = await admin
    .from("payments")
    .select("id")
    .eq("provider", "sonic_pesa")
    .eq("webhook_event_id", eventId)
    .maybeSingle();
  if (existingEvent) return "processed";

  const { data: payment } = await admin
    .from("payments")
    .select(
      "id, food_order_id, amount_tsh, provider_order_id, status, transaction_id, provider_reference",
    )
    .eq("provider", "sonic_pesa")
    .eq("provider_order_id", providerOrderId)
    .maybeSingle();
  if (!payment || payment.amount_tsh !== amount)
    throw new Error("Payment does not match the order");
  if (payment.status === "success") {
    if (
      (transactionId && payment.transaction_id && transactionId !== payment.transaction_id) ||
      (reference && payment.provider_reference && reference !== payment.provider_reference)
    ) {
      throw new Error("Payment transaction does not match the stored payment");
    }
    return "processed";
  }
  if (
    (payment.transaction_id && transactionId !== payment.transaction_id) ||
    (payment.provider_reference && reference !== payment.provider_reference)
  ) {
    throw new Error("Payment transaction does not match the stored payment");
  }

  const { data: order } = await admin
    .from("food_orders")
    .select("user_id, total_tsh")
    .eq("id", payment.food_order_id)
    .maybeSingle();
  if (!order || order.total_tsh !== amount)
    throw new Error("Payment amount does not match the order");

  await confirmSuccessfulPayment(admin, {
    paymentId: payment.id,
    orderId: payment.food_order_id,
    userId: order.user_id,
    amount,
    providerOrderId,
    reference,
    transactionId,
    metadata: payload,
    webhookEventId: eventId,
  });
  return "processed";
}

async function sha256(value: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", toArrayBuffer(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifySignature(
  payload: Uint8Array,
  signature: string,
  secret: string,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, toArrayBuffer(payload));
  const expected = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  if (expected.length !== signature.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  }
  return difference === 0;
}

function toArrayBuffer(value: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(value.byteLength);
  new Uint8Array(buffer).set(value);
  return buffer;
}
