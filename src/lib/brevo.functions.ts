import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Syncs the signed-in user to the Brevo contacts list (MUST Market newsletter).
 * Called fire-and-forget from the client after signup/sign-in. Never throws to
 * the caller — signup UX must stay 100% reliable even if Brevo is down.
 */
export const syncBrevoContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const apiKey = process.env["BREVO_API_KEY"];
      if (!apiKey) {
        console.error("[Brevo] BREVO_API_KEY is not configured");
        return { ok: false as const, reason: "missing_api_key" };
      }

      // Read the caller's identity server-side (never trust client-sent email).
      const {
        data: { user },
        error,
      } = await context.supabase.auth.getUser();
      if (error || !user?.email) {
        return { ok: false as const, reason: "no_user_email" };
      }

      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      const fullName =
        (typeof meta.full_name === "string" && meta.full_name) ||
        (typeof meta.name === "string" && meta.name) ||
        "";
      const firstName = fullName.trim().split(/\s+/)[0] || "Mwanafunzi";

      const res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          attributes: { FIRSTNAME: firstName },
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
      // Network/unknown errors must never break auth flows.
      console.error("[Brevo] Sync error:", err);
      return { ok: false as const, reason: "network_error" };
    }
  });
