import { createFileRoute } from "@tanstack/react-router";

// Uses Sonic Pesa's simplified endpoint which long-polls (waits up to 45s)
// for the user to enter their PIN before returning the final payment status.
const SIMPLIFIED_SONIC_PESA_URL =
  "https://api.sonicpesa.com/api/v1/payment/create_order_simple";

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
              { error: "Taarifa za malipo hazijakamilika." },
              400,
            );
          }

          const apiKey = process.env["SONIC_PESA_API_KEY"];
          if (!apiKey) {
            return jsonResponse(
              { error: "Sonic Pesa API key missing on server." },
              500,
            );
          }

          // Long-polling call (waits up to 45 seconds for PIN entry)
          const res = await fetch(SIMPLIFIED_SONIC_PESA_URL, {
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

          // Extract exact payment_status returned after waiting
          const paymentStatus =
            data?.data?.payment_status || data?.payment_status;

          // Only proceed to Success page if payment_status is explicitly "SUCCESS"
          if (
            !res.ok ||
            data?.status !== "success" ||
            paymentStatus !== "SUCCESS"
          ) {
            return jsonResponse(
              {
                error:
                  paymentStatus === "USERCANCELLED" ||
                  paymentStatus === "CANCELLED"
                    ? "Umeghairi au umekataa ombi la malipo kwenye simu."
                    : data?.message ??
                      "Malipo hayajakamilika. Tafadhali ingiza PIN kwenye simu yako na ujaribu tena.",
              },
              400,
            );
          }

          return jsonResponse(
            {
              ok: true,
              reference: data?.data?.order_id || data?.data?.reference,
              message: "Malipo yamekamilika kikamilifu!",
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
                  : "Mawasiliano na Sonic Pesa yamekatika.",
            },
            502,
          );
        }
      },
    },
  },
});
