import { createFileRoute } from "@tanstack/react-router";

// Allow Vercel serverless function up to 90 seconds execution time
export const maxDuration = 90;

const CREATE_ORDER_URL =
  "https://api.sonicpesa.com/api/v1/payment/create_order";
const ORDER_STATUS_URL =
  "https://api.sonicpesa.com/api/v1/payment/order_status";

type SonicPesaPayload = {
  amount?: number;
  phoneNumber?: string;
  customerName?: string;
  buyerEmail?: string;
  description?: string;
  orderDetails?: {
    items?: { itemId?: string; name?: string; quantity?: number }[];
    deliveryLocation?: string;
    notes?: string;
  };
};

// Normalize any Tanzanian phone input to 255XXXXXXXXX.
function formatTzPhone(input: string): string | null {
  const digits = (input ?? "").replace(/\D/g, "");
  if (!digits) return null;
  let normalized = digits;
  if (normalized.startsWith("0")) normalized = "255" + normalized.slice(1);
  else if (!normalized.startsWith("255") && normalized.length === 9) {
    normalized = "255" + normalized;
  }
  if (normalized.length !== 12 || !normalized.startsWith("255")) return null;
  return normalized;
}

// Dispatch a single SMS via the Messaging Service API V2.
async function sendSms(to: string, text: string): Promise<void> {
  const token = process.env["SMS_API_TOKEN"];
  if (!token) {
    console.warn("[SMS] SMS_API_TOKEN missing — skipping SMS dispatch.");
    return;
  }
  const senderId = process.env["SMS_SENDER_ID"] || "ORDER";
  const res = await fetch(
    "https://messaging-service.co.tz/api/sms/v2/text/single",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ from: senderId, to, text }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[SMS] Dispatch to ${to} failed (${res.status}): ${body}`);
  }
}

// Look up the cook phone for the ordered items and fire both SMS alerts.
async function dispatchOrderSms(opts: {
  orderRef: string;
  itemIds: string[];
  itemSummary: string;
  customerName: string;
  customerPhone: string;
  deliveryLocation: string;
  notes: string;
  amount: number;
}): Promise<void> {
  try {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    let cookPhone: string | null = null;
    if (opts.itemIds.length > 0) {
      const { data } = await supabaseAdmin
        .from("menu_items")
        .select("cook_phone")
        .in("id", opts.itemIds);
      for (const row of data ?? []) {
        const formatted = formatTzPhone(row.cook_phone ?? "");
        if (formatted) {
          cookPhone = formatted;
          break;
        }
      }
    }

    const cookMessage =
      `[MUST MARKET] ODA MPYA! #${opts.orderRef}: ${opts.itemSummary}. ` +
      `Mteja: ${opts.customerName} (${opts.customerPhone}). ` +
      `Mahali: ${opts.deliveryLocation}. Maelekezo: ${opts.notes}. ` +
      `Jumla: TSh ${opts.amount} (IMELIPWA).`;

    const customerMessage =
      `Asante kwa kutumia MUST Market! Oda yako #${opts.orderRef} ` +
      `(${opts.itemSummary}) imepokelewa. Namba ya Mpishi: ${cookPhone ?? "0674044676"}. ` +
      `Msaada: 0674044676.`;

    const dispatches: Promise<void>[] = [sendSms(opts.customerPhone, customerMessage)];
    if (cookPhone) dispatches.push(sendSms(cookPhone, cookMessage));
    await Promise.all(dispatches);
  } catch (err) {
    // SMS failures must never break the payment response.
    console.error("[SMS] Order SMS dispatch failed:", err);
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Helper function to sleep/wait between status checks
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const Route = createFileRoute("/api/public/sonic-pesa-pay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = (await request.json()) as SonicPesaPayload;

          const amount = Math.round(Number(payload.amount));
          let phoneNumber = String(payload.phoneNumber ?? "").replace(/\D/g, "");
          if (phoneNumber.startsWith("0")) {
            phoneNumber = "255" + phoneNumber.substring(1);
          }

          const customerName = String(payload.customerName ?? "").trim();
          const buyerEmail =
            payload.buyerEmail?.trim() || "customer@msosifasta.co.tz";

          if (!amount || amount <= 0 || !phoneNumber || !customerName) {
            return jsonResponse(
              { error: "Taarifa za malipo hazijakamilika." },
              400
            );
          }

          const apiKey = process.env["SONIC_PESA_API_KEY"];
          if (!apiKey) {
            return jsonResponse(
              { error: "Sonic Pesa API key missing on server." },
              500
            );
          }

          // 1. Create the Payment Order & Trigger USSD Push
          const createRes = await fetch(CREATE_ORDER_URL, {
            method: "POST",
            headers: {
              "X-API-KEY": apiKey,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              buyer_email: buyerEmail,
              buyer_name: customerName,
              buyer_phone: phoneNumber,
              amount,
              currency: "TZS",
            }),
          });

          const createData = await createRes.json().catch(() => null);

          if (!createRes.ok || createData?.status !== "success") {
            return jsonResponse(
              {
                error:
                  createData?.message ??
                  "Imeshindwa kutuma ombi la malipo kwenye simu.",
              },
              400
            );
          }

          const orderId =
            createData?.data?.order_id || createData?.data?.reference;

          if (!orderId) {
            return jsonResponse(
              { error: "Order ID haikupatikana kutoka Sonic Pesa." },
              400
            );
          }

          // 2. Poll Order Status every 3 seconds (30 retries x 3s = 90 seconds total)
          const maxRetries = 30;
          for (let i = 0; i < maxRetries; i++) {
            await sleep(3000); // Wait 3 seconds before checking

            const statusRes = await fetch(ORDER_STATUS_URL, {
              method: "POST",
              headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ order_id: orderId }),
            });

            const statusData = await statusRes.json().catch(() => null);
            const currentStatus =
              statusData?.data?.payment_status ||
              statusData?.transaction?.status;

            // If user successfully entered PIN
            if (currentStatus === "SUCCESS") {
              // Fire the dual SMS alerts (cook + customer). Awaited via
              // Promise.all inside; failures never break the payment flow.
              const details = payload.orderDetails;
              const items = (details?.items ?? []).filter(
                (it) => typeof it.name === "string" && it.name,
              );
              if (details && items.length > 0) {
                const itemSummary = items
                  .map((it) => `${it.name} (x${it.quantity ?? 1})`)
                  .join(", ");
                await dispatchOrderSms({
                  orderRef: String(orderId),
                  itemIds: items
                    .map((it) => it.itemId)
                    .filter((id): id is string => Boolean(id)),
                  itemSummary,
                  customerName,
                  customerPhone: phoneNumber,
                  deliveryLocation: details.deliveryLocation ?? "MUST",
                  notes: details.notes ?? "-",
                  amount,
                });
              }
              return jsonResponse(
                {
                  ok: true,
                  reference: orderId,
                  message: "Malipo yamekamilika kikamilifu!",
                  data: statusData?.data,
                },
                200
              );
            }

            // If user explicitly cancelled or transaction failed
            if (
              currentStatus === "USERCANCELLED" ||
              currentStatus === "CANCELLED" ||
              currentStatus === "REJECTED"
            ) {
              return jsonResponse(
                {
                  error: "Umeghairi au umekataa ombi la malipo kwenye simu.",
                },
                400
              );
            }
          }

          // If 90 seconds timeout reached without confirmation
          return jsonResponse(
            {
              error:
                "Muda wa kuingiza PIN umeisha au malipo yanachukua muda. Kama umeshalipa,nitaarifu sasa.",
            },
            400
          );
        } catch (err) {
          return jsonResponse(
            {
              error:
                err instanceof Error
                  ? err.message
                  : "Mawasiliano ya malipo yamekatika.",
            },
            502
          );
        }
      },
    },
  },
});
