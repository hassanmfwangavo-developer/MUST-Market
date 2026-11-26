export const MENU_WINDOW_SIZE = 12;

/** Reveal cached dishes without another database request. */
export function menuWindow<T>(items: readonly T[], page: number): T[] {
  return items.slice(0, Math.max(1, page) * MENU_WINDOW_SIZE);
}