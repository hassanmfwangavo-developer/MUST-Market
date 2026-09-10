// Sonic Pesa mobile money payment gateway helper.
// Calls our same-origin server route (/api/public/sonic-pesa-pay), which
// proxies to Sonic Pesa with the secret API key — no browser CORS issues,
// and the key never ships to the client.

import { sanitizeTzPhoneStrict } from "./formatters";

export type SonicPesaOrderItem = {
  itemId: string;
  name: string;
  quantity: number;
};

export type SonicPesaRequest = {
  amount: number;
  phoneNumber: string; // raw user input; sanitized here
  customerName: string;
  buyerEmail?: string; // user email; server falls back to a default
  description?: string;
  /** Order details used by the server to dispatch SMS alerts on success. */
  orderDetails?: {
    items: SonicPesaOrderItem[];
    deliveryLocation: string;
    notes?: string;
  };
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
  const phone = sanitizeTzPhoneStrict(input.phoneNumber);
  if (!phone) {
    return {
      ok: false,
      message: "Invalid phone number. Use a Tanzanian number (e.g. 07XXXXXXXX).",
    };
  }

  try {
    const res = await fetch("/api/public/sonic-pesa-pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(Number(input.amount)),
        phoneNumber: phone,
        customerName: input.customerName.trim(),
        buyerEmail: input.buyerEmail?.trim() || undefined,
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
