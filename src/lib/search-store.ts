import { useSyncExternalStore } from "react";

let query = "";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setSearchQuery(next: string) {
  query = next;
  listeners.forEach((l) => l());
}

export function useSearchQuery() {
  return useSyncExternalStore(
    subscribe,
    () => query,
    () => "",
  );
}
