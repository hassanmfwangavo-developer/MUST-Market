// Sonic Pesa mobile money payment gateway helper.
// Docs endpoint is configurable so we can point at a sandbox during testing.

import { sanitizeTzPhoneStrict } from "./formatters";

export const SONIC_PESA_ENDPOINT =
  (import.meta.env['VITE_SONIC_PESA_API_URL'] as string | undefined) ??
  "https://api.sonicpesa.com/v1/payments";

export type SonicPesaRequest = {
  amount: number;
  phoneNumber: string; // raw user input; sanitized here
  customerName: string;
  description?: string;
};

export type SonicPesaResult = {
  ok: boolean;
  reference?: string;
  message?: string;
};

type SonicPesaPayload = {
  reference?: string;
  id?: string;
  message?: string;
  error?: string;
  data?: { reference?: string; id?: string };
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

  const phone = sanitizeTzPhoneStrict(input.phoneNumber);
  if (!phone) {
    return {
      ok: false,
      message: "Invalid phone number. Use a Tanzanian number (e.g. 07XXXXXXXX).",
    };
  }

  try {
    const res = await fetch(SONIC_PESA_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(Number(input.amount)),
        phone_number: phone,
        customer_name: input.customerName.trim(),
        currency: "TZS",
        description: input.description ?? "Msosi Fasta Food Order",
      }),
    });

    const payload = (await res.json().catch(() => null)) as
      | SonicPesaPayload
      | null;

    if (!res.ok) {
      return {
        ok: false,
        message:
          payload?.message ?? payload?.error ?? `Payment failed (${res.status}).`,
      };
    }

    return {
      ok: true,
      reference:
        payload?.reference ?? payload?.id ?? payload?.data?.reference ?? payload?.data?.id,
    };
  } catch {
    return {
      ok: false,
      message: "Network error reaching Sonic Pesa. Please try again.",
    };
  }
}
