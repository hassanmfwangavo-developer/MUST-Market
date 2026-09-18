import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2, Upload, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AdminTabs } from "@/components/admin-tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { removeAdminImage, uploadAdminImage } from "@/lib/admin-media";
import { ALLOWED_IMAGE_ACCEPT, ALLOWED_IMAGE_TYPES } from "@/lib/uploads";
import {
  fetchAllCampusServices,
  formatServicePrice,
  SERVICE_CATEGORIES,
  type CampusService,
} from "@/lib/campus-services";

export const Route = createFileRoute("/admin/services")({
  head: () => ({
    meta: [
      { title: "Service Mall Manager — MUST Market Admin" },
      {
        name: "description",
        content: "Add, edit and remove campus service providers listed in the MUST Service Mall.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminServicesPage,
});

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface-2 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

interface FormState {
  title: string;
  category: string;
  provider_name: string;
  location: string;
  starting_price: string;
  description: string;
  operating_hours: string;
  phone_number: string;
  whatsapp_number: string;
  is_verified: boolean;
  is_active: boolean;
}

const emptyForm: FormState = {
  title: "",
  category: SERVICE_CATEGORIES[0].value,
  provider_name: "",
  location: "",
  starting_price: "",
  description: "",
  operating_hours: "",
  phone_number: "",
  whatsapp_number: "",
  is_verified: true,
  is_active: true,
};

function AdminServicesPage() {
  const queryClient = useQueryClient();
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-campus-services"],
    queryFn: fetchAllCampusServices,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CampusService | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [pendingDelete, setPendingDelete] = useState<CampusService | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-campus-services"] });
    queryClient.invalidateQueries({ queryKey: ["campus-services"] });
    queryClient.invalidateQueries({ queryKey: ["campus-services-count"] });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFile(null);
    setPreview("");
    setModalOpen(true);
  };

  const openEdit = (service: CampusService) => {
    setEditing(service);
    setForm({
      title: service.title,
      category: service.category,
      provider_name: service.provider_name,
      location: service.location,
      starting_price: String(service.starting_price ?? ""),
      description: service.description,
      operating_hours: service.operating_hours ?? "",
      phone_number: service.phone_number,
      whatsapp_number: service.whatsapp_number,
      is_verified: service.is_verified,
      is_active: service.is_active,
    });
    setFile(null);
    setPreview(service.image_url ?? "");
    setModalOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error("Please add the provider or business title.");
      if (!form.phone_number.trim()) throw new Error("Please add a phone number.");

      let image_url = editing?.image_url ?? null;
      let image_path = editing?.image_path ?? null;
      let replacedPath: string | null = null;

      if (file) {
        const uploaded = await uploadAdminImage(file, "services");
        replacedPath = image_path;
        image_url = uploaded.url;
        image_path = uploaded.path;
      }

      const payload = {
        title: form.title.trim(),
        category: form.category,
        provider_name: form.provider_name.trim(),
        location: form.location.trim(),
        starting_price: Number(form.starting_price) || 0,
        description: form.description.trim(),
        operating_hours: form.operating_hours.trim() || null,
        phone_number: form.phone_number.replace(/\s/g, ""),
        whatsapp_number: (form.whatsapp_number || form.phone_number).replace(/\s/g, ""),
        image_url,
        image_path,
        is_verified: form.is_verified,
        is_active: form.is_active,
      };

      const { error } = editing
        ? await supabase.from("campus_services").update(payload).eq("id", editing.id)
        : await supabase.from("campus_services").insert(payload);

      if (error) {
        if (image_path && file) await removeAdminImage(image_path);
        throw new Error(
          error.code === "42501"
            ? "Save failed: administrator access could not be verified."
            : error.message,
        );
      }
      if (replacedPath) await removeAdminImage(replacedPath);
    },
    onSuccess: () => {
      invalidate();
      toast.success(editing ? "Service provider updated" : "Service provider added");
      setModalOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async (service: CampusService) => {
      const { error } = await supabase
        .from("campus_services")
        .update({ is_active: !service.is_active })
        .eq("id", service.id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (service: CampusService) => {
      const { error } = await supabase.from("campus_services").delete().eq("id", service.id);
      if (error) throw error;
      if (service.image_path) await removeAdminImage(service.image_path);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Service provider removed");
      setPendingDelete(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Service Mall Manager</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the campus service providers shown on the public Service Mall page.
        </p>
        <AdminTabs />

        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={openCreate} className="h-11 rounded-xl">
            <Plus className="h-4 w-4" /> Add Service Provider
          </Button>
        </div>

        {isLoading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : services.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
            <p className="text-sm text-muted-foreground">No services listed yet.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`flex flex-wrap items-center gap-4 p-4 ${index > 0 ? "border-t border-border" : ""}`}
              >
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                  {service.image_url && (
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-[180px] flex-1">
                  <p className="font-semibold text-foreground">{service.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {service.category} · {service.location || "No location"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {service.phone_number} · From {formatServicePrice(service.starting_price)}
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={service.is_active}
                    onChange={() => toggleActive.mutate(service)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  Active
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => openEdit(service)}
                    aria-label={`Edit ${service.title}`}
                    className="h-10 w-10 rounded-xl"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setPendingDelete(service)}
                    aria-label={`Delete ${service.title}`}
                    className="h-10 w-10 rounded-xl border-destructive/30 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />

      <Dialog open={modalOpen} onOpenChange={(open) => !open && setModalOpen(false)}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-2xl border-border bg-surface">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl text-foreground">
              {editing ? "Edit Service Provider" : "Add Service Provider"}
            </DialogTitle>
            <DialogDescription>
              Details here appear instantly on the public Service Mall page.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <label className="block cursor-pointer">
              <span className={labelClass}>Cover photo</span>
              <div className="grid h-36 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-surface-2 text-sm text-muted-foreground transition-colors hover:border-primary">
                {preview ? (
                  <img src={preview} alt="Provider preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex flex-col items-center gap-1.5">
                    <Upload className="h-5 w-5" /> Upload photo
                  </span>
                )}
              </div>
              <input
                type="file"
                accept={ALLOWED_IMAGE_ACCEPT}
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
                    toast.error("Only JPG, PNG, WEBP or GIF images are allowed.");
                    return;
                  }
                  setFile(f);
                  setPreview(URL.createObjectURL(f));
                }}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="svc-title">
                  Business / Provider title
                </label>
                <input
                  id="svc-title"
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Fundi Sam Tech"
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="svc-category">
                  Category
                </label>
                <select
                  id="svc-category"
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.icon} {c.value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="svc-provider">
                  Provider name
                </label>
                <input
                  id="svc-provider"
                  className={inputClass}
                  value={form.provider_name}
                  onChange={(e) => setForm({ ...form, provider_name: e.target.value })}
                  placeholder="Samson Mwakyusa"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="svc-location">
                  Location
                </label>
                <input
                  id="svc-location"
                  className={inputClass}
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Block B / Iyunga Gate"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="svc-price">
                  Starting price (TZS)
                </label>
                <input
                  id="svc-price"
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.starting_price}
                  onChange={(e) => setForm({ ...form, starting_price: e.target.value })}
                  placeholder="5000"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="svc-hours">
                  Operating hours
                </label>
                <input
                  id="svc-hours"
                  className={inputClass}
                  value={form.operating_hours}
                  onChange={(e) => setForm({ ...form, operating_hours: e.target.value })}
                  placeholder="Mon-Sat 8:00 AM - 8:00 PM"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="svc-phone">
                  Phone number
                </label>
                <input
                  id="svc-phone"
                  className={inputClass}
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  placeholder="255674044676"
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="svc-whatsapp">
                  WhatsApp number
                </label>
                <input
                  id="svc-whatsapp"
                  className={inputClass}
                  value={form.whatsapp_number}
                  onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                  placeholder="255674044676"
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="svc-description">
                Full description
              </label>
              <textarea
                id="svc-description"
                rows={4}
                className="w-full rounded-xl border border-border bg-surface-2 p-3.5 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-primary focus:bg-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Services offered, prices and anything students should know."
              />
            </div>

            <div className="flex flex-wrap gap-5">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={form.is_verified}
                  onChange={(e) => setForm({ ...form, is_verified: e.target.checked })}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                Verified Provider Badge
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                Is Active
              </label>
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row-reverse">
              <Button type="submit" disabled={save.isPending} className="h-11 rounded-xl sm:flex-1">
                {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Save changes" : "Add provider"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="h-11 rounded-xl sm:flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this service listing?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.title} will no longer appear in the Service Mall. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && remove.mutate(pendingDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
