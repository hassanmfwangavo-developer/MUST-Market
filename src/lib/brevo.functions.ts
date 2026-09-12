import { createServerFn } from "@tanstack/react-start";

/**
 * Syncs a contact to the Brevo list (MUST Market newsletter).
 * Called fire-and-forget from the client after signup/sign-in with the
 * user's email + firstName. Never throws to the caller — auth UX must
 * stay 100% reliable even if Brevo is down.
 *
 * NOTE: No Supabase admin/service-role usage here — the key never leaves
 * the server (BREVO_API_KEY is read inside the handler only).
 */
export const syncBrevoContact = createServerFn({ method: "POST" })
  .inputValidator((data: { email?: string; firstName?: string }) => {
    const email = typeof data?.email === "string" ? data.email.trim() : "";
    const firstName =
      typeof data?.firstName === "string" ? data.firstName.trim() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email for Brevo sync");
    }
    return { email, firstName };
  })
  .handler(async ({ data }) => {
    try {
      const apiKey = process.env["BREVO_API_KEY"];
      if (!apiKey) {
        console.error("[Brevo] BREVO_API_KEY is not configured");
        return { ok: false as const, reason: "missing_api_key" };
      }

      const res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          attributes: { FIRSTNAME: data.firstName || "Mwanafunzi" },
          listIds: [2],
          updateEnabled: true,
        }),
      });

      if (res.status === 201 || res.status === 204) {
        console.log(`[Brevo] Contact synced (${res.status})`);
        return { ok: true as const };
      }

      const body = await res.text();
      console.error(`[Brevo] Sync failed [${res.status}]: ${body}`);
      return { ok: false as const, reason: `brevo_${res.status}` };
    } catch (err) {
      console.error("[Brevo] Sync error:", err);
      return { ok: false as const, reason: "network_error" };
    }
  });
