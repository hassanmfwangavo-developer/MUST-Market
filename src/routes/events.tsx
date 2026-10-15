import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, ChevronDown, Loader2, MapPin, Megaphone, Phone, Pin, Plus, User as UserIcon } from "lucide-react";
import { imageSrcSet, thumbUrl } from "@/lib/images";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { openAuthModal, useAuthUser } from "@/lib/auth-store";
import { ALLOWED_IMAGE_ACCEPT } from "@/lib/uploads";
import { canonical } from "@/lib/site";
import {
  EVENT_CATEGORIES,
  PUBLIC_EVENTS_KEY,
  categoryMeta,
  fetchPublicEvents,
  formatEventDate,
  uploadEventFlyer,
  type CampusEvent,
} from "@/lib/campus-events";

const eventsQuery = queryOptions({ queryKey: PUBLIC_EVENTS_KEY, queryFn: fetchPublicEvents });

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "MUST News & Events — Campus Notices, Sports & Parties" },
      { name: "description", content: "Daily news, notices and events happening at MUST: academic schedules, sports, guild & club events and entertainment." },
      { property: "og:title", content: "MUST News & Events" },
      { property: "og:description", content: "Everything happening on campus today, this week and coming up." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: canonical("/events") }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(eventsQuery),
  component: EventsPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-destructive" role="alert">{error instanceof Error ? error.message : "Something went wrong"}</div>
  ),
  notFoundComponent: () => <div className="p-8 text-center">Not found.</div>,
});

type When = "all" | "today" | "week" | "upcoming";
type Kind = "all" | "event" | "news";

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function EventsPage() {
  const { data: events } = useSuspenseQuery(eventsQuery);
  const [when, setWhen] = useState<When>("all");
  const [cat, setCat] = useState<string>("all");
  const [kind, setKind] = useState<Kind>("all");
  const [open, setOpen] = useState(false);
  const { user } = useAuthUser();

  const filtered = useMemo(() => {
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 864e5);
    return events.filter((e) => {
      if (cat !== "all" && e.category !== cat) return false;
      if (kind !== "all" && e.kind !== kind) return false;
      if (when === "all") return true;
      if (!e.event_date) return false;
      const d = new Date(e.event_date);
      if (when === "today") return sameDay(d, now);
      if (when === "week") return d >= new Date(now.toDateString()) && d <= weekEnd;
      return d >= now;
    });
  }, [events, cat, kind, when]);

  const pinned = filtered.filter((e) => e.is_pinned);
  const rest = filtered.filter((e) => !e.is_pinned);

  const pill = (active: boolean) =>
    `shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Campus Hub</p>
            <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">News & Events</h1>
            <p className="mt-2 text-muted-foreground">Kila kinachoendelea MUST — leo, wiki hii na kinachokuja.</p>
          </div>
          <Button
            size="lg"
            onClick={() => (user ? setOpen(true) : openAuthModal("/events"))}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" /> Tangaza Tukio / Tangazo
          </Button>
        </header>

        <div className="mt-6 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["all", "today", "week", "upcoming"] as When[]).map((w) => (
              <button key={w} className={pill(when === w)} onClick={() => setWhen(w)}>
                {{ all: "All dates", today: "Today", week: "This Week", upcoming: "Upcoming" }[w]}
              </button>
            ))}
            <span className="mx-1 w-px shrink-0 bg-border" />
            {(["all", "event", "news"] as Kind[]).map((k) => (
              <button key={k} className={pill(kind === k)} onClick={() => setKind(k)}>
                {{ all: "All types", event: "Events", news: "News & Notices" }[k]}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button className={pill(cat === "all")} onClick={() => setCat("all")}>All</button>
            {EVENT_CATEGORIES.map((c) => (
              <button key={c.value} className={pill(cat === c.value)} onClick={() => setCat(c.value)}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {pinned.length > 0 && (
          <section className="mt-6 space-y-3">
            {pinned.map((e) => (
              <div key={e.id} className="rounded-2xl border border-accent bg-accent/15 p-4 sm:p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-foreground">
                  <Pin className="h-3.5 w-3.5" /> Pinned · {categoryMeta(e.category).label}
                </div>
                <h2 className="mt-1 text-lg font-bold">{e.title}</h2>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{e.content}</p>
                <Meta e={e} />
              </div>
            ))}
          </section>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {rest.map((e) => <EventCard key={e.id} e={e} />)}
        </section>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
            <Megaphone className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">Hakuna matukio kwa sasa.</p>
            <p className="text-sm text-muted-foreground">Kuwa wa kwanza kutangaza tukio la chuo!</p>
          </div>
        )}
      </main>
      <Footer />
      <SubmitDialog open={open} onOpenChange={setOpen} userId={user?.id ?? null} />
    </div>
  );
}

function Meta({ e }: { e: CampusEvent }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {e.event_date && <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatEventDate(e.event_date)}</span>}
      {e.venue && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.venue}</span>}
      {e.organizer_name && <span className="flex items-center gap-1"><UserIcon className="h-3.5 w-3.5" />{e.organizer_name}</span>}
      {e.contact_phone && (
        <a href={`tel:${e.contact_phone}`} className="flex items-center gap-1 text-primary"><Phone className="h-3.5 w-3.5" />{e.contact_phone}</a>
      )}
    </div>
  );
}

function EventCard({ e }: { e: CampusEvent }) {
  const c = categoryMeta(e.category);
  const d = e.event_date ? new Date(e.event_date) : null;
  const [expanded, setExpanded] = useState(false);
  const isLong = e.content.length > 220;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {e.image_url && (
        <img
          src={thumbUrl(e.image_url)}
          srcSet={imageSrcSet(e.image_url, [400, 800, 1200], 80)}
          sizes="(min-width: 640px) 50vw, 100vw"
          alt={e.title}
          loading="lazy"
          decoding="async"
          className="aspect-video w-full object-cover"
        />
      )}
      <div className="flex gap-4 p-4">
        {d && (
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <span className="text-[10px] font-semibold uppercase">{d.toLocaleString("en-GB", { month: "short" })}</span>
            <span className="text-xl font-bold leading-none">{d.getDate()}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
            <span className="rounded-full bg-muted px-2 py-0.5">{c.emoji} {c.label}</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{e.kind === "news" ? "News" : "Event"}</span>
          </div>
          <h3 className="mt-1.5 font-bold leading-snug">{e.title}</h3>
          <p className={`mt-1 whitespace-pre-line text-sm text-muted-foreground ${expanded ? "" : "line-clamp-4"}`}>
            {e.content}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              aria-expanded={expanded}
            >
              {expanded ? "Show Less" : "See More"}
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
          <Meta e={e} />
        </div>
      </div>
    </article>
  );
}

function SubmitDialog({ open, onOpenChange, userId }: { open: boolean; onOpenChange: (v: boolean) => void; userId: string | null }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [kind, setKind] = useState<"event" | "news">("event");
  const [category, setCategory] = useState<string>("notices");
  const [file, setFile] = useState<File | null>(null);

  async function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!userId) return;
    const f = new FormData(ev.currentTarget);
    const title = String(f.get("title") ?? "").trim();
    const content = String(f.get("content") ?? "").trim();
    if (title.length < 4 || content.length < 10) {
      toast.error("Weka kichwa na maelezo kamili.");
      return;
    }
    setBusy(true);
    try {
      const image_url = file ? await uploadEventFlyer(userId, file) : null;
      const date = String(f.get("date") ?? "");
      const { error } = await supabase.from("campus_events").insert({
        title: title.slice(0, 160),
        content: content.slice(0, 4000),
        kind,
        category,
        event_date: date ? new Date(date).toISOString() : null,
        venue: String(f.get("venue") ?? "").trim() || null,
        organizer_name: String(f.get("organizer") ?? "").trim().slice(0, 120),
        contact_phone: String(f.get("phone") ?? "").trim() || null,
        image_url,
        submitted_by: userId,
        status: "pending",
      });
      if (error) throw error;
      setDone(true);
      qc.invalidateQueries({ queryKey: PUBLIC_EVENTS_KEY });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Imeshindikana kutuma.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) { setDone(false); setFile(null); }
      }}
    >
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{done ? "Asante! 🎉" : "Tangaza Tukio au Tangazo"}</DialogTitle>
          <DialogDescription>
            {done
              ? "Tangazo lako litakaguliwa na kuwekwa hewani ndani ya muda mfupi."
              : "Itakaguliwa na admin kabla ya kuonekana kwa wanafunzi wote."}
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <Button onClick={() => onOpenChange(false)}>Sawa</Button>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {(["event", "news"] as const).map((k) => (
                <button type="button" key={k} onClick={() => setKind(k)}
                  className={`rounded-xl border p-3 text-sm font-semibold ${kind === k ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                  {k === "event" ? "📅 Event" : "📢 News / Notice"}
                </button>
              ))}
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {EVENT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
            </select>
            <Input name="title" placeholder="Title (e.g. MUST Sports Bonanza)" maxLength={160} required />
            <Textarea name="content" placeholder="Maelezo kamili..." rows={4} maxLength={4000} required />
            <div className="grid gap-2 sm:grid-cols-2">
              <Input name="date" type="datetime-local" aria-label="Date & time" />
              <Input name="venue" placeholder="Venue / Location" maxLength={120} />
              <Input name="organizer" placeholder="Organizer name" maxLength={120} />
              <Input name="phone" type="tel" placeholder="Contact phone" maxLength={20} />
            </div>
            <label className="block text-sm">
              <span className="text-muted-foreground">Flyer / picha (optional)</span>
              <input type="file" accept={ALLOWED_IMAGE_ACCEPT} onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1 block w-full text-sm" />
            </label>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Tuma kwa Ukaguzi
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
