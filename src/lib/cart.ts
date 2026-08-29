import { useSyncExternalStore } from "react";
import type { OrderItem } from "./orders";

let items: OrderItem[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getCartItems(): OrderItem[] {
  return items;
}

export function setCartItems(next: OrderItem[]) {
  items = next;
  emit();
}

export function clearCart() {
  items = [];
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useCart() {
  const current = useSyncExternalStore(subscribe, getCartItems);
  return { items: current, setItems: setCartItems, clear: clearCart };
}
