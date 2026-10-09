import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChefHat, Loader2, Trash2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchVendors } from "@/lib/vendors";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({
    meta: [
      { title: "Vendor Access — MUST Market Admin" },
      {
        name: "description",
        content: "Assign restaurant partners to their Msosi Fasta vendor dashboard.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VendorAccessManager,
});

interface VendorMemberRow {
  id: string;
  user_id: string;
  vendor_id: string;
  email: string | null;
  created_at: string;
}

async function fetchVendorMembers(): Promise<VendorMemberRow[]> {
  const { data, error } = await supabase
    .from("vendor_members")
    .select("id, user_id, vendor_id, email, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as VendorMemberRow[];
}

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none";

function VendorAccessManager() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [vendorId, setVendorId] = useState("");

  const vendors = useQuery({ queryKey: ["vendors"], queryFn: fetchVendors });
  const members = useQuery({ queryKey: ["vendor-members"], queryFn: fetchVendorMembers });

  const assign = useMutation({
    mutationFn: async () => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) throw new Error("Enter the restaurant owner's email.");
      if (!vendorId) throw new Error("Choose a restaurant.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .ilike("email", cleanEmail)
        .maybeSingle();
      if (profileError) throw new Error(profileError.message);
      if (!profile)
        throw new Error("No account found with that email. Ask them to sign up first, then assign.");

      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: profile.id, role: "vendor" }, { onConflict: "user_id,role" });
      if (roleError) throw new Error(roleError.message);

      const { error: memberError } = await supabase
        .from("vendor_members")
        .upsert({ user_id: profile.id, vendor_id: vendorId, email: cleanEmail }, { onConflict: "user_id" });
      if (memberError) throw new Error(memberError.message);
    },
    onSuccess: () => {
      toast.success("Restaurant partner assigned — they can now open the Vendor Portal.");
      setEmail("");
      setVendorId("");
      void queryClient.invalidateQueries({ queryKey: ["vendor-members"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revoke = useMutation({
    mutationFn: async (row: VendorMemberRow) => {
      const { error } = await supabase.from("vendor_members").delete().eq("id", row.id);
      if (error) throw new Error(error.message);
      await supabase.from("user_roles").delete().eq("user_id", row.user_id).eq("role", "vendor");
    },
    onSuccess: () => {
      toast.success("Vendor access removed.");
      void queryClient.invalidateQueries({ queryKey: ["vendor-members"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const vendorName = (id: string) => vendors.data?.find((v) => v.id === id)?.name ?? "Restaurant";

  return (
    <div className="bg-background">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Vendor Access
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Link a restaurant owner's account to their cafeteria. They then see only their own orders,
          revenue and menu.
        </p>

        <section className="mt-6 rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <UserPlus className="h-4 w-4 text-primary" /> Assign a restaurant partner
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@gmail.com"
              className={inputClass}
            />
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className={inputClass}
            >
              <option value="">Choose restaurant…</option>
              {(vendors.data ?? []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={assign.isPending}
              onClick={() => assign.mutate()}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {assign.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChefHat className="h-4 w-4" />
              )}
              Assign
            </button>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <h2 className="text-sm font-bold text-foreground">Current restaurant partners</h2>
          {members.isLoading ? (
            <div className="grid place-items-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (members.data ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No restaurant partners assigned yet.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {(members.data ?? []).map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface-2 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {m.email ?? m.user_id}
                    </p>
                    <p className="text-xs text-muted-foreground">{vendorName(m.vendor_id)}</p>
                  </div>
                  <button
                    type="button"
                    disabled={revoke.isPending}
                    onClick={() => revoke.mutate(m)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
