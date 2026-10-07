import { useState } from "react";
import { Check, Loader2, MapPin, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatTsh, type MenuItem } from "@/lib/menu";
import { submitBatchPreorder } from "@/lib/batch-preorders";
import { sanitizeTzPhoneStrict } from "@/lib/formatters";
import { BATCH_SLOTS, HOSTEL_ZONES, type BatchSlot, type HostelZone } from "@/lib/order-batches";

export function VendorPreorderDialog({ meal, vendorId, open, onOpenChange }: { meal: MenuItem | null; vendorId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [batch, setBatch] = useState<BatchSlot | "">("");
  const [zone, setZone] = useState<HostelZone | "">("");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [room, setRoom] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!meal || !batch || !zone) return toast.error("Chagua batch na hostel drop zone.");
    const normalizedPhone = sanitizeTzPhoneStrict(phone);
    if (name.trim().length < 2 || !normalizedPhone || !room.trim()) return toast.error("Jaza jina, simu sahihi na room/details.");
    setSaving(true);
    try {
      await submitBatchPreorder({
        items: [{ mealId: meal.id, name: meal.name, price: meal.price, quantity }],
        total: meal.price * quantity,
        batchSlot: batch,
        hostelZone: zone,
        customerName: name,
        phone: normalizedPhone,
        room,
        vendorId,
      });
      toast.success("Pre-order yako imepokelewa!");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Pre-order imeshindikana.");
    } finally {
      setSaving(false);
    }
  };

  if (!meal) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pre-Order (Delivery)</DialogTitle>
          <DialogDescription>{meal.name} · {formatTsh(meal.price, "TSh")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <ChoiceSection label="Chagua batch">
            <div className="grid grid-cols-2 gap-2">
              {BATCH_SLOTS.map((slot) => <Button key={slot.value} type="button" variant="outline" onClick={() => setBatch(slot.value)} className={`h-auto min-h-20 whitespace-normal px-3 py-3 ${batch === slot.value ? "border-primary bg-primary-soft ring-2 ring-primary/20 hover:bg-primary-soft" : ""}`}><span className="text-left"><strong className="block">{slot.title}</strong><small className="text-muted-foreground">{slot.deliveryAt}</small></span>{batch === slot.value && <Check />}</Button>)}
            </div>
          </ChoiceSection>
          <ChoiceSection label="Hostel drop zone">
            <div className="grid gap-2">
              {HOSTEL_ZONES.map((hostel) => <Button key={hostel.value} type="button" variant="outline" onClick={() => setZone(hostel.value)} className={`h-auto justify-start whitespace-normal py-3 ${zone === hostel.value ? "border-primary bg-primary-soft hover:bg-primary-soft" : ""}`}><MapPin /><span className="text-left text-xs font-bold sm:text-sm">{hostel.title}</span></Button>)}
            </div>
          </ChoiceSection>
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
            <span className="font-bold text-foreground">Idadi</span>
            <div className="flex items-center gap-3"><Button type="button" size="icon" variant="outline" disabled={quantity === 1} onClick={() => setQuantity((value) => value - 1)}><Minus /></Button><strong>{quantity}</strong><Button type="button" size="icon" onClick={() => setQuantity((value) => Math.min(20, value + 1))}><Plus /></Button></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input aria-label="Full Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full Name" className={inputClass} />
            <input aria-label="Phone Number" value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" placeholder="07XXXXXXXX" className={inputClass} />
            <input aria-label="Room Number or Details" value={room} onChange={(event) => setRoom(event.target.value)} placeholder="Room Number / Details" className={`${inputClass} sm:col-span-2`} />
          </div>
          <Button type="button" size="lg" className="h-12 w-full" disabled={saving} onClick={submit}>{saving && <Loader2 className="animate-spin" />}Thibitisha · {formatTsh(meal.price * quantity, "TSh")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const inputClass = "h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";
function ChoiceSection({ label, children }: { label: string; children: React.ReactNode }) { return <section><h3 className="mb-2 text-sm font-bold text-foreground">{label}</h3>{children}</section>; }