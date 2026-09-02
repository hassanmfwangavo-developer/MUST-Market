import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/sonicpesa/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBytes = new Uint8Array(await request.arrayBuffer());
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { handleSonicPesaWebhook } = await import("@/lib/payment.server");
          await handleSonicPesaWebhook(
            supabaseAdmin,
            rawBytes,
            request.headers.get("X-SonicPesa-Signature"),
          );
          return Response.json({ received: true });
        } catch {
          return Response.json({ received: false }, { status: 400 });
        }
      },
    },
  },
});
