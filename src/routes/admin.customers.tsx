import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Wateja wa Msosi — MUST Market Admin" },
      { name: "description", content: "Msosi Fasta customer phone numbers for the WhatsApp group." },
      { property: "og:title", content: "Wateja wa Msosi — MUST Market Admin" },
      { property: "og:description", content: "Msosi Fasta customer list." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["msosi-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("msosi_customers")
        .select("*")
        .order("last_order_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const copyAll = async () => {
    const list = data.map((c) => "+255" + c.phone_key).join("\n");
    try {
      await navigator.clipboard.writeText(list);
      toast.success(`Namba ${data.length} zimenakiliwa.`);
    } catch {
      toast.error("Imeshindikana kunakili.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Wateja wa Msosi Fasta</h1>
          <p className="text-sm text-muted-foreground">{data.length} wateja</p>
        </div>
        <Button onClick={copyAll} disabled={!data.length}>📋 Copy WhatsApp Numbers</Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="p-3">Jina</th>
              <th className="p-3">Namba</th>
              <th className="p-3">Location</th>
              <th className="p-3">Oda</th>
              <th className="p-3">Mara ya mwisho</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-4 text-muted-foreground">Inapakia…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-muted-foreground">Hakuna wateja bado.</td></tr>
            ) : (
              data.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3 font-medium text-foreground">{c.full_name || "—"}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3">{c.location || "—"}</td>
                  <td className="p-3">{c.total_orders}</td>
                  <td className="p-3">{new Date(c.last_order_at).toLocaleDateString("en-GB")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
