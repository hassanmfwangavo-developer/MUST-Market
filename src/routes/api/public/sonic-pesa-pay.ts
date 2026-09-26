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
  cookPhone?: string;
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
async function sendSms(to: string, text: string, orderId: string): Promise<void> {
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
      body: JSON.stringify({
        from: senderId,
        to,
        text,
        flash: 0,
        reference: String(orderId),
      }),
    },
  );
  const apiResponse = await res.json().catch(() => null);
  console.log("SMS Response:", JSON.stringify(apiResponse));
  if (!res.ok) {
    console.error(`[SMS] Dispatch to ${to} failed (${res.status})`);
  }
}

// Fire both SMS alerts (cook + customer) using the cook phone supplied by
// the checkout payload. No database calls — fully self-contained.
async function dispatchOrderSms(opts: {
  orderRef: string;
  cookPhone: string;
  itemSummary: string;
  customerName: string;
  customerPhone: string;
  deliveryLocation: string;
  notes: string;
  amount: number;
}): Promise<void> {
  try {
    const cookPhone =
      formatTzPhone(opts.cookPhone) ?? "255674044676";

    const cookMessage =
      `[MUST MARKET] ODA MPYA! #${opts.orderRef}: ${opts.itemSummary}. ` +
      `Mteja: ${opts.customerName} (${opts.customerPhone}). ` +
      `Mahali: ${opts.deliveryLocation}. Maelekezo: ${opts.notes}. ` +
      `Jumla: TSh ${opts.amount} (IMELIPWA).`;

    const customerMessage =
      `Asante kwa kutumia MUST Market! Oda yako #${opts.orderRef} ` +
      `(${opts.itemSummary}) imepokelewa. Namba ya Mpishi: ${cookPhone}. ` +
      `Msaada: 0674044676.`;

    await Promise.all([
      sendSms(cookPhone, cookMessage, opts.orderRef),
      sendSms(opts.customerPhone, customerMessage, opts.orderRef),
    ]);
  } catch (err) {
    // SMS failures must never break the payment response.
    console.error("[SMS] Order SMS dispatch failed:", err);
  }
}

const ADMIN_NOTIFY_EMAIL = "hassani@mustmarket.store";

type PaymentNotifyStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "ERROR";

// Fire-and-forget admin email via Brevo. Never throws, never blocks checkout.
async function notifyAdminPayment(opts: {
  status: PaymentNotifyStatus;
  amount: number;
  phone: string;
  customerName: string;
  orderRef?: string;
  serviceType?: string;
  reason?: string;
}): Promise<void> {
  try {
    const apiKey = process.env["BREVO_API_KEY"];
    if (!apiKey) {
      console.warn("[AdminNotify] BREVO_API_KEY missing — skipping email.");
      return;
    }
    const success = opts.status === "SUCCESS";
    const subject = success
      ? `🟢 [NEW ORDER PAID] MUST Market - TZS ${opts.amount}`
      : `🔴 [PAYMENT ${opts.status}] MUST Market - TZS ${opts.amount}`;
    const rows: [string, string][] = [
      ["Payment Status", opts.status],
      ["Customer", `${opts.customerName} (${opts.phone})`],
      ["Order Reference", opts.orderRef ?? "—"],
      ["Total Amount", `TZS ${opts.amount}`],
      ["Service Type", opts.serviceType ?? "Msosi Fasta"],
      ["Timestamp", new Date().toISOString()],
    ];
    if (opts.reason) rows.push(["Failure Reason", opts.reason]);
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#ffffff">
        <h2 style="margin:0 0 16px;color:${success ? "#008542" : "#dc2626"}">${subject}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${rows
            .map(
              ([k, v]) =>
                `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:bold;width:40%">${k}</td><td style="padding:8px 12px;border:1px solid #e2e8f0">${v}</td></tr>`,
            )
            .join("")}
        </table>
        <p style="margin-top:16px;font-size:12px;color:#64748b">Automated payment notification from MUST Market checkout.</p>
      </div>`;
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "MUST Market Payments", email: ADMIN_NOTIFY_EMAIL },
        to: [{ email: ADMIN_NOTIFY_EMAIL }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      console.error(`[AdminNotify] Brevo send failed [${res.status}]: ${await res.text()}`);
    }
  } catch (err) {
    console.error("[AdminNotify] Email dispatch error:", err);
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
            await notifyAdminPayment({
              status: "FAILED",
              amount,
              phone: phoneNumber,
              customerName,
              reason:
                createData?.message ??
                "Sonic Pesa rejected the payment order request.",
            });
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
            await notifyAdminPayment({
              status: "ERROR",
              amount,
              phone: phoneNumber,
              customerName,
              reason: "Sonic Pesa did not return an order ID.",
            });
            return jsonResponse(
              { error: "Order ID haikupatikana kutoka Sonic Pesa." },
              400
            );
          }

          // Notify admin that a payment attempt has started (USSD push sent).
          await notifyAdminPayment({
            status: "PENDING",
            amount,
            phone: phoneNumber,
            customerName,
            orderRef: String(orderId),
          });

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
              await notifyAdminPayment({
                status: "SUCCESS",
                amount,
                phone: phoneNumber,
                customerName,
                orderRef: String(orderId),
              });
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
                  cookPhone: payload.cookPhone ?? "",
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
              await notifyAdminPayment({
                status: "CANCELLED",
                amount,
                phone: phoneNumber,
                customerName,
                orderRef: String(orderId),
                reason: `Customer cancelled or payment was rejected (${currentStatus}).`,
              });
              return jsonResponse(
                {
                  error: "Umeghairi au umekataa ombi la malipo kwenye simu.",
                },
                400
              );
            }
          }

          // If 90 seconds timeout reached without confirmation
          await notifyAdminPayment({
            status: "FAILED",
            amount,
            phone: phoneNumber,
            customerName,
            orderRef: String(orderId),
            reason: "Timed out after 90 seconds — customer never confirmed the PIN.",
          });
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
