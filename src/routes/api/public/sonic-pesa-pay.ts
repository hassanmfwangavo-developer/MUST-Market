import { createFileRoute } from "@tanstack/react-router";

// Server-side proxy for the Sonic Pesa payment gateway.
// Keeps SONIC_PESA_API_KEY on the server and eliminates browser CORS issues.

const DEFAULT_SONIC_PESA_URL = "https://api.sonicpesa.com/api/v1/payments";

type SonicPesaPayload = {
  amount?: number;
  phoneNumber?: string;
  customerName?: string;
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
          const phoneNumber = String(payload.phoneNumber ?? "").replace(
            /\D/g,
            "",
          );
          const customerName = String(payload.customerName ?? "").trim();
          const description =
            payload.description?.trim() || "Msosi Fasta Food Order";

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
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              amount,
              phone_number: phoneNumber,
              customer_name: customerName,
              currency: "TZS",
              description,
            }),
          });

          const data = await res.json().catch(() => null);

          if (!res.ok) {
            return jsonResponse(
              {
                error:
                  data?.message ??
                  data?.error ??
                  `Payment failed (${res.status}).`,
              },
              res.status,
            );
          }

          return jsonResponse(data, 200);
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
