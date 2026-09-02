// Sonic Pesa mobile money payment gateway helper.
// Docs endpoint is configurable so we can point at a sandbox during testing.

export const SONIC_PESA_ENDPOINT =
  (import.meta.env['VITE_SONIC_PESA_API_URL'] as string | undefined) ??
  "https://api.sonicpesa.com/v1/payments";

export type SonicPesaRequest = {
  amount: number;
  phoneNumber: string; // already sanitized: 255XXXXXXXXX
  customerName: string;
  description?: string;
};

export type SonicPesaResult = {
  ok: boolean;
  reference?: string;
  message?: string;
};

export async function initiateSonicPesaPayment(
  input: SonicPesaRequest,
): Promise<SonicPesaResult> {
  const apiKey = import.meta.env['VITE_SONIC_PESA_API_KEY'] as
    | string
    | undefined;

  if (!apiKey) {
    return {
      ok: false,
      message:
        "Sonic Pesa is not configured yet. Please add the payment API key.",
    };
  }

  try {
    const res = await fetch(SONIC_PESA_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amount,
        phone_number: input.phoneNumber,
        customer_name: input.customerName,
        currency: "TZS",
        description: input.description ?? "Msosi Fasta Food Order",
      }),
    });

    const payload = (await res.json().catch(() => null)) as
      | { reference?: string; id?: string; message?: string }
      | null;

    if (!res.ok) {
      return {
        ok: false,
        message: payload?.message ?? `Payment failed (${res.status}).`,
      };
    }

    return { ok: true, reference: payload?.reference ?? payload?.id };
  } catch {
    return {
      ok: false,
      message: "Network error reaching Sonic Pesa. Please try again.",
    };
  }
}
