import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchPortalAccess } from "@/lib/vendor-portal";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await fetchPortalAccess();
      if (cancelled) return;
      const ok = access.role === "admin";
      setAllowed(ok);
      if (ok) return;
      toast.error("Unauthorized Access: Administrator rights required.");
      // Vendors land in their own kitchen portal; everyone else goes home.
      navigate({ to: access.role === "vendor" ? "/vendor/dashboard" : "/", replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (allowed !== true) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <Outlet />;
}
