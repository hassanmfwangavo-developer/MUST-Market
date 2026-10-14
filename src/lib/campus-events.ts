import { supabase } from "@/integrations/supabase/client";

export const EVENT_CATEGORIES = [
  { value: "notices", label: "Campus Notices", emoji: "📢" },
  { value: "academic", label: "Academic Schedules", emoji: "📚" },
  { value: "sports", label: "Sports & Games", emoji: "⚽" },
  { value: "guild", label: "Guild & Club Events", emoji: "🎓" },
  { value: "entertainment", label: "Entertainment & Parties", emoji: "🎉" },
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number]["value"];
export type EventKind = "event" | "news";

export interface CampusEvent {
  id: string;
  title: string;
  content: string;
  kind: EventKind;
  category: EventCategory;
  event_date: string | null;
  venue: string | null;
  image_url: string | null;
  organizer_name: string;
  contact_phone: string | null;
  submitted_by: string | null;
  status: "pending" | "approved" | "rejected";
  is_pinned: boolean;
  created_at: string;
}

export const categoryMeta = (v: string) =>
  EVENT_CATEGORIES.find((c) => c.value === v) ?? EVENT_CATEGORIES[0];

export const PUBLIC_EVENTS_KEY = ["campus-events", "public"] as const;
export const ADMIN_EVENTS_KEY = ["campus-events", "admin"] as const;

export async function fetchPublicEvents(): Promise<CampusEvent[]> {
  const { data, error } = await supabase
    .from("campus_events")
    .select("*")
    .eq("status", "approved")
    .order("is_pinned", { ascending: false })
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as CampusEvent[];
}

export async function fetchAdminEvents(): Promise<CampusEvent[]> {
  const { data, error } = await supabase
    .from("campus_events")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as CampusEvent[];
}

/** Uploads a flyer to the signed-in user's own folder and returns a long-lived link. */
export async function uploadEventFlyer(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/events-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Flyer upload failed: ${error.message}`);
  const { data, error: signErr } = await supabase.storage
    .from("product-images")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (signErr || !data) throw new Error("Could not prepare flyer link");
  return data.signedUrl;
}

export function formatEventDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
