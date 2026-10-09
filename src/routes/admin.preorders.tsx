import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardCopy, Loader2, Pencil, Plus, Printer, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { uploadAdminImage } from "@/lib/admin-media";
import { ALLOWED_IMAGE_ACCEPT } from "@/lib/uploads";
import { formatTsh } from "@/lib/menu";
import { BATCH_SLOTS, HOSTEL_ZONES } from "@/lib/order-batches";
import {
  fetchBatchPreorders,
  fetchPreorderMeals,
  PREORDER_MEALS_KEY,
  type BatchPreorder,
  type PreorderMeal,
} from "@/lib/batch-preorders";

export const Route = createFileRoute("/admin/preorders")({
  head: () => ({
    meta: [
      { title: "Pre-Order Manager — MUST Market Admin" },
      { name: "description", content: "Manage the meals offered in the Msosi Fasta hostel batch pre-order system." },
      { property: "og:title", content: "Pre-Order Manager — MUST Market Admin" },
      { property: "og:description", content: "Admin tools for hostel batch pre-orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPreorders,
});

type Draft = { id?: string; name: string; description: string; price: string; image_url: string | null; is_active: boolean };
const EMPTY: Draft = { name: "", description: "", price: "", image_url: null, is_active: true };

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function BatchOperations({ orders }: { orders: BatchPreorder[] }) {
  const [slot, setSlot] = useState<string>("lunch");
  const [date, setDate] = useState<string>(todayLocal());
  const [printOpen, setPrintOpen] = useState(false);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        if (o.batch_slot !== slot) return false;
        const d = new Date(o.created_at);
        const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return local === date;
      }),
    [orders, slot, date],
  );

  const mealTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of filtered) for (const i of o.items) map.set(i.name, (map.get(i.name) ?? 0) + i.quantity);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const zoneTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of filtered) {
      const count = o.items.reduce((s, i) => s + i.quantity, 0);
      map.set(o.hostel_zone, (map.get(o.hostel_zone) ?? 0) + count);
    }
    return map;
  }, [filtered]);

  const totalMeals = mealTotals.reduce((s, [, c]) => s + c, 0);
  const slotInfo = BATCH_SLOTS.find((b) => b.value === slot);
  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const copyWhatsApp = async () => {
    const zoneLine = (v: string, label: string) => `• ${label}: ${zoneTotals.get(v) ?? 0} meals`;
    const text = [
      "🥣 *MSOSI FASTA BATCH SUMMARY*",
      `📅 Date: ${dateLabel} | Slot: ${slotInfo?.title ?? slot}`,
      "",
      "*TOTAL MEALS TO PREPARE:*",
      ...(mealTotals.length ? mealTotals.map(([n, c]) => `- ${n}: ${c}`) : ["- (no orders)"]),
      "",
      "*HOSTEL DISPATCH BREAKDOWN:*",
      zoneLine("boys_6", "Boys Hostels (6A & 6B)"),
      zoneLine("girls_8", "Girls Hostels (8A & 8B)"),
      zoneLine("new_hostels", "New Hostels Zone"),
      "",
      `TOTAL ORDERS: ${filtered.length} (${totalMeals} meals)`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Batch summary copied — paste it in WhatsApp");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-semibold text-foreground">Batch Operations</h2>
      <p className="mt-1 text-xs text-muted-foreground">Kitchen summary and packing sheet for one delivery batch.</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {BATCH_SLOTS.map((b) => (
          <button
            key={b.value}
            onClick={() => setSlot(b.value)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              slot === b.value ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {b.icon} {b.title}
          </button>
        ))}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value || todayLocal())}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          aria-label="Batch date"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-3 text-sm">
          <p className="text-xs text-muted-foreground">Orders</p>
          <p className="text-lg font-bold text-foreground">{filtered.length}</p>
        </div>
        <div className="rounded-xl border border-border p-3 text-sm">
          <p className="text-xs text-muted-foreground">Total meals</p>
          <p className="text-lg font-bold text-foreground">{totalMeals}</p>
        </div>
        <div className="rounded-xl border border-border p-3 text-sm">
          <p className="text-xs text-muted-foreground">Meal types</p>
          <p className="text-lg font-bold text-foreground">{mealTotals.length}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={copyWhatsApp} disabled={filtered.length === 0}>
          <ClipboardCopy className="h-4 w-4" /> 📋 Copy WhatsApp Batch Summary
        </Button>
        <Button variant="outline" onClick={() => setPrintOpen(true)} disabled={filtered.length === 0}>
          <Printer className="h-4 w-4" /> Print Packing Sheet
        </Button>
      </div>

      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="max-w-3xl print:max-w-none print:shadow-none print:border-0">
          <DialogHeader className="print:hidden">
            <DialogTitle>Packing Sheet — {slotInfo?.title} · {dateLabel}</DialogTitle>
            <DialogDescription>Use your browser's print dialog. Only the sheet below will print.</DialogDescription>
          </DialogHeader>
          <div id="packing-sheet" className="text-sm">
            <h3 className="text-lg font-bold">MSOSI FASTA — PACKING SHEET</h3>
            <p className="text-xs text-muted-foreground">{slotInfo?.icon} {slotInfo?.title} (deliver {slotInfo?.deliveryAt}) · {dateLabel} · {filtered.length} orders / {totalMeals} meals</p>
            <table className="mt-3 w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-1 pr-2">✓</th>
                  <th className="py-1 pr-2">Order</th>
                  <th className="py-1 pr-2">Customer</th>
                  <th className="py-1 pr-2">Phone</th>
                  <th className="py-1 pr-2">Meals</th>
                  <th className="py-1 pr-2">Hostel Zone</th>
                  <th className="py-1">Room</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border/60 align-top">
                    <td className="py-1.5 pr-2"><span className="inline-block h-3.5 w-3.5 rounded-sm border border-foreground" /></td>
                    <td className="py-1.5 pr-2 font-mono">{o.id.slice(0, 8)}</td>
                    <td className="py-1.5 pr-2">{o.customer_name}</td>
                    <td className="py-1.5 pr-2">{o.phone}</td>
                    <td className="py-1.5 pr-2">{o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}</td>
                    <td className="py-1.5 pr-2">{HOSTEL_ZONES.find((z) => z.value === o.hostel_zone)?.title ?? o.hostel_zone}</td>
                    <td className="py-1.5">{o.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button className="print:hidden" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function AdminPreorders() {
  const qc = useQueryClient();
  const meals = useQuery({ queryKey: PREORDER_MEALS_KEY, queryFn: fetchPreorderMeals });
  const orders = useQuery({ queryKey: ["batch-preorders"], queryFn: fetchBatchPreorders });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: PREORDER_MEALS_KEY });

  const save = async () => {
    if (!draft) return;
    const price = Math.round(Number(draft.price));
    if (!draft.name.trim() || !Number.isFinite(price) || price < 0) {
      toast.error("Weka jina na bei sahihi.");
      return;
    }
    setSaving(true);
    const row = {
      name: draft.name.trim().slice(0, 100),
      description: draft.description.trim().slice(0, 300),
      price_tsh: price,
      image_url: draft.image_url,
      is_active: draft.is_active,
    };
    const { error } = draft.id
      ? await supabase.from("preorder_meals").update(row).eq("id", draft.id)
      : await supabase.from("preorder_meals").insert(row);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Meal saved");
    setDraft(null);
    refresh();
  };

  const toggle = async (m: PreorderMeal, v: boolean) => {
    const { error } = await supabase.from("preorder_meals").update({ is_active: v }).eq("id", m.id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const remove = async (m: PreorderMeal) => {
    if (!confirm(`Delete "${m.name}"?`)) return;
    const { error } = await supabase.from("preorder_meals").delete().eq("id", m.id);
    if (error) return toast.error(error.message);
    toast.success("Meal deleted");
    refresh();
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadAdminImage(file, "preorder-meals");
      setDraft((d) => (d ? { ...d, image_url: res.url } : d));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col bg-background">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pre-Order System</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Only the meals listed here appear in the "Weka Order Sasa" form on Msosi Fasta.
        </p>

        <BatchOperations orders={orders.data ?? []} />

        <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Pre-Order Meals</h2>
            <Button onClick={() => setDraft(EMPTY)}>
              <Plus className="h-4 w-4" /> Add Meal
            </Button>
          </div>
          {meals.isLoading ? (
            <Loader2 className="mx-auto mt-6 h-5 w-5 animate-spin text-primary" />
          ) : (meals.data ?? []).length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No pre-order meals yet. Add the first one.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {(meals.data ?? []).map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-3">
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name} className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{formatTsh(m.price_tsh, "TSh")}</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch checked={m.is_active} onCheckedChange={(v) => toggle(m, v)} />
                    {m.is_active ? "Shown" : "Hidden"}
                  </label>
                  <Button variant="ghost" size="icon" aria-label={`Edit ${m.name}`} onClick={() => setDraft({ id: m.id, name: m.name, description: m.description, price: String(m.price_tsh), image_url: m.image_url, is_active: m.is_active })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${m.name}`} onClick={() => remove(m)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold text-foreground">Received Pre-Orders</h2>
          {orders.isLoading ? (
            <Loader2 className="mx-auto mt-6 h-5 w-5 animate-spin text-primary" />
          ) : (orders.data ?? []).length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No pre-orders yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {(orders.data ?? []).map((o) => (
                <li key={o.id} className="rounded-xl border border-border p-3 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-semibold text-foreground">{o.customer_name} · {o.phone}</span>
                    <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")} — {formatTsh(o.total_tsh, "TSh")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {BATCH_SLOTS.find((b) => b.value === o.batch_slot)?.title} ·{" "}
                    {HOSTEL_ZONES.find((z) => z.value === o.hostel_zone)?.title} · {o.room}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <Dialog open={!!draft} onOpenChange={(v) => !v && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit Pre-Order Meal" : "Add Pre-Order Meal"}</DialogTitle>
            <DialogDescription>Shown in the "Weka Order Sasa" form.</DialogDescription>
          </DialogHeader>
          {draft && (
            <div className="space-y-3">
              <input className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" placeholder="Meal name" value={draft.name} maxLength={100} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              <input className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" placeholder="Price (TZS)" inputMode="numeric" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value.replace(/\D/g, "") })} />
              <textarea className="w-full rounded-lg border border-border bg-background p-3 text-sm" rows={2} placeholder="Short description (optional)" value={draft.description} maxLength={300} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              <div className="flex items-center gap-3">
                {draft.image_url && <img src={draft.image_url} alt="" className="h-14 w-14 rounded-lg object-cover" />}
                <label className="cursor-pointer text-sm font-medium text-primary">
                  {uploading ? "Uploading…" : draft.image_url ? "Change photo" : "Upload photo"}
                  <input type="file" accept={ALLOWED_IMAGE_ACCEPT} className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={draft.is_active} onCheckedChange={(v) => setDraft({ ...draft, is_active: v })} /> Show in pre-order form
              </label>
              <Button className="w-full" onClick={save} disabled={saving || uploading}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
