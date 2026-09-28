import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Images, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { uploadAdminImage, removeAdminImage } from "@/lib/admin-media";
import { BOOKS_BANNER_QUERY_KEY, fetchBooksBanners, type BooksBanner } from "@/lib/books-banners";
import { ALLOWED_IMAGE_ACCEPT, ALLOWED_IMAGE_TYPES } from "@/lib/uploads";

export function AdminBooksBanners() {
  const queryClient = useQueryClient();
  const { data: banners = [], isLoading, isError } = useQuery({
    queryKey: BOOKS_BANNER_QUERY_KEY,
    queryFn: fetchBooksBanners,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: BOOKS_BANNER_QUERY_KEY });

  const save = useMutation({
    mutationFn: async ({ slot, file, existing }: { slot: number; file: File; existing?: BooksBanner }) => {
      const uploaded = await uploadAdminImage(file, "books-banners");
      try {
        if (existing) {
          const { data, error } = await supabase.from("books_store_banners")
            .update({ image_url: uploaded.url, image_path: uploaded.path })
            .eq("id", existing.id)
            .select("id").single();
          if (error || !data) throw error ?? new Error("Banner could not be updated.");
        } else {
          const { error } = await supabase.from("books_store_banners").insert({ slot, image_url: uploaded.url, image_path: uploaded.path });
          if (error) throw error;
        }
      } catch (error) {
        await removeAdminImage(uploaded.path);
        throw error;
      }
      if (existing) await removeAdminImage(existing.image_path);
    },
    onSuccess: () => { refresh(); toast.success("Books Store image saved"); },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (banner: BooksBanner) => {
      const { data, error } = await supabase.from("books_store_banners")
        .delete().eq("id", banner.id).select("id").single();
      if (error || !data) throw error ?? new Error("Banner could not be deleted.");
      await removeAdminImage(banner.image_path);
    },
    onSuccess: () => { refresh(); toast.success("Books Store image removed"); },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="mt-6 rounded-lg border border-border bg-surface p-4 shadow-soft sm:p-5">
      <div className="flex items-center gap-2">
        <Images className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Books Store Banner</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Add up to three images. Replace an image by uploading into its slot. When all slots are empty, the default book images appear.</p>
      {isLoading ? <Loader2 className="mt-4 h-5 w-5 animate-spin text-primary" aria-label="Loading book banners" /> : isError ? (
        <p className="mt-4 text-sm text-destructive">Could not load banner images. Please try again.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((slot) => {
            const banner = banners.find((item) => item.slot === slot);
            return (
              <div key={slot} className="relative h-32 overflow-hidden rounded-md border border-border bg-surface-2">
                {banner && <img src={banner.image_url} alt={`Books Store slide ${slot}`} className="absolute inset-0 h-full w-full object-cover" />}
                <label className={`absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1.5 text-xs font-medium transition-colors ${banner ? "bg-foreground/50 text-banner-foreground opacity-0 hover:opacity-100 focus-within:opacity-100" : "text-muted-foreground hover:text-primary"}`}>
                  {save.isPending && save.variables?.slot === slot ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  {banner ? `Replace image ${slot}` : `Upload image ${slot}`}
                  <input
                    type="file" accept={ALLOWED_IMAGE_ACCEPT} className="sr-only"
                    aria-label={`${banner ? "Replace" : "Upload"} Books Store image ${slot}`}
                    disabled={save.isPending || remove.isPending}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (!file) return;
                      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                        toast.error("Only JPG, PNG, WEBP or GIF images are allowed.");
                        return;
                      }
                      save.mutate({ slot, file, existing: banner });
                    }}
                  />
                </label>
                {banner && <Button type="button" variant="destructive" size="icon" aria-label={`Delete Books Store image ${slot}`} title={`Delete Books Store image ${slot}`} disabled={save.isPending || remove.isPending} onClick={() => { if (window.confirm(`Delete Books Store image ${slot}?`)) remove.mutate(banner); }} className="absolute right-2 top-2 h-8 w-8"><Trash2 /></Button>}
                <span className="pointer-events-none absolute bottom-2 left-2 rounded-sm bg-foreground/70 px-2 py-0.5 text-xs text-banner-foreground">{slot}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}