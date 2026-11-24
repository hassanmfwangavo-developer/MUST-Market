import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ListingPagination({ hasMore, pending, failed, onMore }: {
  hasMore: boolean; pending: boolean; failed: boolean; onMore: () => void;
}) {
  if (!hasMore) return null;
  return <div className="mt-8 flex justify-center">
    <Button type="button" disabled={pending} onClick={onMore}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      {failed ? "Retry loading" : pending ? "Loading…" : "Load more"}
    </Button>
  </div>;
}