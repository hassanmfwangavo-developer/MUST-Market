import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  effects: [] as (() => void)[],
  handlers: [] as { config: Record<string, string>; callback: () => void }[],
  status: null as ((status: string) => void) | null,
  invalidate: vi.fn(), remove: vi.fn(), channel: vi.fn(),
}));
vi.mock("react", () => ({ useEffect: (effect: () => (() => void) | undefined) => {
  const cleanup = effect();
  if (cleanup) mocks.effects.push(cleanup);
} }));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({
  invalidateQueries: mocks.invalidate,
  getQueryState: () => ({ fetchStatus: "idle", dataUpdatedAt: Date.now() }),
}) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  channel: (name: string) => {
    mocks.channel(name);
    const channel = {
      on: (_event: string, config: Record<string, string>, callback: () => void) => {
        mocks.handlers.push({ config, callback });
        return channel;
      },
      subscribe: (callback: (status: string) => void) => { mocks.status = callback; return channel; },
    };
    return channel;
  },
  removeChannel: mocks.remove,
} }));
import { useVendorOrderFeed } from "./use-vendor-order-feed";

afterEach(() => {
  for (const cleanup of mocks.effects) cleanup();
  mocks.effects.length = 0;
  mocks.handlers.length = 0;
  mocks.status = null;
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("vendor realtime request control", () => {
  it("subscribes only to INSERT and UPDATE events scoped to the selected vendor", () => {
    useVendorOrderFeed(true, "restaurant-1");
    expect(mocks.handlers).toHaveLength(2);
    for (const { config } of mocks.handlers) {
      expect(config['filter']).toBe("vendor_id=eq.restaurant-1");
      expect(["INSERT", "UPDATE"]).toContain(config['event']);
    }
  });

  it("coalesces event bursts into one refresh of only the selected order query", () => {
    vi.useFakeTimers();
    useVendorOrderFeed(true, "restaurant-1");
    const handler = mocks.handlers[0];
    if (!handler) throw new Error("Missing order handler");
    for (let i = 0; i < 12; i++) handler.callback();
    expect(mocks.invalidate).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(mocks.invalidate).toHaveBeenCalledTimes(1);
    expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["vendor-orders", "restaurant-1"], exact: true });
  });

  it("removes the channel and cancels queued refreshes on unmount", () => {
    vi.useFakeTimers();
    useVendorOrderFeed(true, "restaurant-1");
    mocks.handlers[0]?.callback();
    const cleanup = mocks.effects.pop();
    if (!cleanup) throw new Error("Missing cleanup");
    cleanup();
    vi.advanceTimersByTime(1000);
    expect(mocks.remove).toHaveBeenCalledTimes(1);
    expect(mocks.invalidate).not.toHaveBeenCalled();
  });

  it("does not refetch freshly loaded orders on first connection, but refreshes on reconnect", () => {
    vi.useFakeTimers();
    useVendorOrderFeed(true, "restaurant-1");
    mocks.status?.("SUBSCRIBED");
    vi.advanceTimersByTime(1000);
    expect(mocks.invalidate).not.toHaveBeenCalled();
    mocks.status?.("SUBSCRIBED");
    vi.advanceTimersByTime(1000);
    expect(mocks.invalidate).toHaveBeenCalledTimes(1);
  });

  it("uses a different channel name for each mount", () => {
    useVendorOrderFeed(true, "restaurant-1");
    useVendorOrderFeed(true, "restaurant-1");
    expect(mocks.channel.mock.calls[0]?.[0]).not.toBe(mocks.channel.mock.calls[1]?.[0]);
  });
});