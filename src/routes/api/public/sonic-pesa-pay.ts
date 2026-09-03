import { createFileRoute } from "@tanstack/react-router";

// Server-side proxy for the Sonic Pesa payment gateway.
// Keeps SONIC_PESA_API_KEY on the server and eliminates browser CORS issues.

const DEFAULT_SONIC_PESA_URL =
  "https://api.sonicpesa.com/api/v1/payment/create_order";

type SonicPesaPayload = {
  amount?: number;
  phoneNumber?: string;
  customerName?: string;
  buyerEmail?: string;
  description?: string;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/sonic-pesa-pay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = (await request.json()) as SonicPesaPayload;

          const amount = Math.round(Number(payload.amount));
          let phoneNumber = String(payload.phoneNumber ?? "").replace(
            /\D/g,
            "",
          );
          if (phoneNumber.startsWith("0")) {
            phoneNumber = "255" + phoneNumber.substring(1);
          }

          const customerName = String(payload.customerName ?? "").trim();
          const buyerEmail =
            payload.buyerEmail?.trim() || "customer@msosifasta.co.tz";

          if (!amount || amount <= 0 || !phoneNumber || !customerName) {
            return jsonResponse(
              {
                error:
                  "Missing or invalid amount, phoneNumber, or customerName.",
              },
              400,
            );
          }

          const apiKey = process.env["SONIC_PESA_API_KEY"];
          if (!apiKey) {
            return jsonResponse(
              {
                error:
                  "Sonic Pesa API key is not configured on the server.",
              },
              500,
            );
          }

          const sonicPesaUrl =
            process.env["SONIC_PESA_API_URL"] ?? DEFAULT_SONIC_PESA_URL;

          const res = await fetch(sonicPesaUrl, {
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

          const data = await res.json().catch(() => null);

          if (!res.ok || data?.status !== "success") {
            return jsonResponse(
              {
                error:
                  data?.message ??
                  data?.error ??
                  `Payment failed (${res.status}).`,
              },
              res.status === 200 ? 400 : res.status,
            );
          }

          return jsonResponse(
            {
              ok: true,
              reference: data?.data?.order_id || data?.data?.reference,
              message: data?.message,
              data: data?.data,
            },
            200,
          );
        } catch (err) {
          return jsonResponse(
            {
              error:
                err instanceof Error
                  ? err.message
                  : "Network error reaching Sonic Pesa.",
            },
            502,
          );
        }
      },
    },
  },
});
