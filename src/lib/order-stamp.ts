/**
 * Kitchen clock formatting for order cards.
 *
 * Order timestamps are stored in UTC; the kitchen works in East Africa Time, so
 * the stamp is pinned to that zone instead of whichever timezone a device happens
 * to be set to.
 */
export function formatOrderStamp(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Dar_es_Salaam",
  });
}
