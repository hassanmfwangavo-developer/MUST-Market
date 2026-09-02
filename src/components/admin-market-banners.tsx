import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Images, Loader2, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { removeAdminImage, uploadAdminImage } from "@/lib/admin-media";
import { ALLOWED_IMAGE_ACCEPT, ALLOWED_IMAGE_TYPES } from "@/lib/uploads";
import {
  fetchMarketBanners,
  MAX_MARKET_BANNERS,
  type MarketBanner,
} from "@/lib/market-banners";

/** Image-only marketplace hero banners (max 3), rendered as an autoplay slideshow. */
export function AdminMarketBanners() {
  const queryClient = useQueryClient();
  const { data: banners = [], isLoading } = useQuery<MarketBanner[]>({
    queryKey: ["market-banners"],
    queryFn: fetchMarketBanners,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["market-banners"] });

  const add = useMutation({
    mutationFn: async (file: File) => {
      const uploaded = await uploadAdminImage(file, "banners");
      const { error } = await supabase.from("market_banners").insert({
        image_url: uploaded.url,
        image_path: uploaded.path,
        display_order: banners.length,
      });
      if (error) {
        await removeAdminImage(uploaded.path);
        throw new Error(
          error.code === "42501"
            ? "Upload failed: administrator access could not be verified."
            : error.message,
        );
      }
    },
    onSuccess: () => {
      invalidate();
      toast.success("Banner image added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (b: MarketBanner) => {
      const { error } = await supabase.from("market_banners").delete().eq("id", b.id);
      if (error) throw error;
      if (b.image_path) await removeAdminImage(b.image_path);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Banner image removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const full = banners.length >= MAX_MARKET_BANNERS;

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-4 shadow-soft sm:p-5">
      <div className="flex items-center gap-2">
        <Images className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Marketplace banner slideshow</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Upload up to {MAX_MARKET_BANNERS} images. They rotate automatically on the marketplace homepage.
      </p>

      {isLoading ? (
        <div className="grid place-items-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="relative overflow-hidden rounded-xl border border-border bg-surface-2"
            >
              <img src={b.image_url} alt="Marketplace banner" className="h-28 w-full object-cover" />
              <button
                type="button"
                onClick={() => remove.mutate(b)}
                disabled={remove.isPending}
                aria-label="Remove banner image"
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-destructive/90 text-destructive-foreground disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {!full && (
            <label className="grid h-28 cursor-pointer place-items-center rounded-xl border border-dashed border-border bg-surface-2 text-sm text-muted-foreground transition-colors hover:border-primary">
              {add.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <span className="flex flex-col items-center gap-1.5">
                  <Upload className="h-5 w-5" />
                  Upload banner image
                </span>
              )}
              <input
                type="file"
                accept={ALLOWED_IMAGE_ACCEPT}
                className="sr-only"
                disabled={add.isPending}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
                    toast.error("Only JPG, PNG, WEBP or GIF images are allowed.");
                    return;
                  }
                  add.mutate(f);
                }}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
