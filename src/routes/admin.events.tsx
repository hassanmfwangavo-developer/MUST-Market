import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Loader2, Pin, PinOff, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { uploadAdminImage } from "@/lib/admin-media";
import { ALLOWED_IMAGE_ACCEPT } from "@/lib/uploads";
import {
  ADMIN_EVENTS_KEY,
  EVENT_CATEGORIES,
  PUBLIC_EVENTS_KEY,
  categoryMeta,
  fetchAdminEvents,
  formatEventDate,
  type CampusEvent,
} from "@/lib/campus-events";

export const Route = createFileRoute("/admin/events")({
  head: () => ({
    meta: [
      { title: "News & Events — MUST Market Admin" },
      { name: "description", content: "Approve student event submissions and post official campus notices." },
      { property: "og:title", content: "News & Events — MUST Market Admin" },
      { property: "og:description", content: "Moderate campus news and events." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminEvents,
});

type Filter = "pending" | "approved" | "rejected";

function AdminEvents() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ADMIN_EVENTS_KEY, queryFn: fetchAdminEvents });
  const [filter, setFilter] = useState<Filter>("pending");
  const list = data.filter((e) => e.status === filter);
  const count = (s: Filter) => data.filter((e) => e.status === s).length;

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ADMIN_EVENTS_KEY });
    qc.invalidateQueries({ queryKey: PUBLIC_EVENTS_KEY });
  };

  async function update(id: string, patch: Partial<CampusEvent>, msg: string) {
    const { error } = await supabase.from("campus_events").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(msg);
    refresh();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this post permanently?")) return;
    const { error } = await supabase.from("campus_events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">News & Events</h1>
        <p className="text-sm text-muted-foreground">Review student submissions or post official notices directly.</p>
      </div>

      <CreateForm onDone={refresh} />

      <div className="flex gap-2 overflow-x-auto">
        {(["pending", "approved", "rejected"] as Filter[]).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">
            {f} ({count(f)})
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nothing here.</p>
      ) : (
        <div className="space-y-3">
          {list.map((e) => (
            <div key={e.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row">
              {e.image_url && <img src={e.image_url} alt="" className="h-24 w-full rounded-lg object-cover sm:w-36" />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
                  <span className="rounded-full bg-muted px-2 py-0.5">{categoryMeta(e.category).label}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5">{e.kind === "news" ? "News" : "Event"}</span>
                  {e.is_pinned && <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">Pinned</span>}
                </div>
                <h3 className="mt-1 font-semibold">{e.title}</h3>
                <p className="line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">{e.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[formatEventDate(e.event_date), e.venue, e.organizer_name, e.contact_phone].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:w-44 sm:grid-cols-1">
                {e.status !== "approved" && (
                  <Button size="sm" onClick={() => update(e.id, { status: "approved" }, "Published")}>
                    <Check className="h-4 w-4" /> Approve & Publish
                  </Button>
                )}
                {e.status !== "rejected" && (
                  <Button size="sm" variant="outline" onClick={() => update(e.id, { status: "rejected", is_pinned: false }, "Rejected")}>
                    <X className="h-4 w-4" /> Reject
                  </Button>
                )}
                {e.status === "approved" && (
                  <Button size="sm" variant="outline" onClick={() => update(e.id, { is_pinned: !e.is_pinned }, e.is_pinned ? "Unpinned" : "Pinned")}>
                    {e.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />} {e.is_pinned ? "Unpin" : "Pin to Top"}
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => remove(e.id)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const image_url = file ? (await uploadAdminImage(file, "events")).url : null;
      const date = String(f.get("date") ?? "");
      const { error } = await supabase.from("campus_events").insert({
        title: String(f.get("title")).trim(),
        content: String(f.get("content")).trim(),
        kind: String(f.get("kind")),
        category: String(f.get("category")),
        event_date: date ? new Date(date).toISOString() : null,
        venue: String(f.get("venue") ?? "").trim() || null,
        organizer_name: String(f.get("organizer") ?? "").trim() || "MUST Market",
        contact_phone: String(f.get("phone") ?? "").trim() || null,
        image_url,
        is_pinned: pinned,
        status: "approved",
        submitted_by: auth.user?.id ?? null,
      });
      if (error) throw error;
      toast.success("Posted live");
      form.reset();
      setPinned(false);
      setFile(null);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setBusy(false);
    }
  }

  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h2 className="font-semibold">Post official news / event</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        <select name="kind" className={sel} defaultValue="news">
          <option value="news">📢 News / Notice</option>
          <option value="event">📅 Event</option>
        </select>
        <select name="category" className={sel} defaultValue="notices">
          {EVENT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
        </select>
      </div>
      <Input name="title" placeholder="Title" required maxLength={160} />
      <Textarea name="content" placeholder="Details" rows={3} required maxLength={4000} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Input name="date" type="datetime-local" aria-label="Date & time" />
        <Input name="venue" placeholder="Venue" />
        <Input name="organizer" placeholder="Organizer (default: MUST Market)" />
        <Input name="phone" type="tel" placeholder="Contact phone" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input type="file" accept={ALLOWED_IMAGE_ACCEPT} onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={pinned} onCheckedChange={setPinned} /> Pin to top
        </label>
      </div>
      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Publish now
      </Button>
    </form>
  );
}
