import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** One scoped subscription per mounted portal, with burst updates coalesced. */
export function useVendorOrderFeed(enabled: boolean, vendorId: string | null) {
  const client = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    const scope = vendorId ?? "all";
    const tables = [
      { table: "food_orders", key: "vendor-orders" },
    ];
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const refresh = (key: string) => {
      const previous = timers.get(key);
      if (previous) clearTimeout(previous);
      timers.set(key, setTimeout(() => {
        timers.delete(key);
        void client.invalidateQueries({ queryKey: [key, scope], exact: true });
      }, 1000));
    };
    const channel = supabase.channel(`vendor-orders-${scope}-${crypto.randomUUID()}`);
    for (const { table, key } of tables) {
      for (const event of ["INSERT", "UPDATE"] as const) {
        channel.on("postgres_changes", {
          event, schema: "public", table,
          ...(vendorId ? { filter: `vendor_id=eq.${vendorId}` } : {}),
        }, () => refresh(key));
      }
    }
    let subscribed = false;
    channel.subscribe((status) => {
      if (status !== "SUBSCRIBED") return;
      for (const { key } of tables) {
        const state = client.getQueryState([key, scope]);
        if (subscribed || (state && state.fetchStatus !== "fetching" && Date.now() - state.dataUpdatedAt > 10_000)) {
          refresh(key);
        }
      }
      subscribed = true;
    });
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [client, enabled, vendorId]);
}