export const BATCH_SLOTS = [
  {
    value: "lunch",
    title: "Lunch Batch",
    icon: "☀️",
    orderBy: "11:30 AM",
    deliveryAt: "12:30 PM",
  },
  {
    value: "dinner",
    title: "Dinner Batch",
    icon: "🌙",
    orderBy: "06:30 PM",
    deliveryAt: "07:30 PM",
  },
] as const;

export const HOSTEL_ZONES = [
  {
    value: "boys_6",
    title: "Boys Hostels (Block 6A & 6B)",
    icon: "👦",
    dropPoint: "Nearby Area",
  },
  {
    value: "girls_8",
    title: "Girls Hostels (Block 8A & 8B)",
    icon: "👧",
    dropPoint: "Nearby Area",
  },
  {
    value: "new_hostels",
    title: "New Hostels Zone",
    icon: "🏢",
    dropPoint: "Nearby Area",
  },
] as const;

export type BatchSlot = (typeof BATCH_SLOTS)[number]["value"];
export type HostelZone = (typeof HOSTEL_ZONES)[number]["value"];

export function batchSlotLabel(value: string | null): string {
  const slot = BATCH_SLOTS.find((entry) => entry.value === value);
  return slot ? `${slot.icon} ${slot.title} · ${slot.deliveryAt}` : "Unassigned batch";
}

export function hostelZoneLabel(value: string | null): string {
  const zone = HOSTEL_ZONES.find((entry) => entry.value === value);
  return zone ? `${zone.icon} ${zone.title}` : "Legacy delivery area";
}
