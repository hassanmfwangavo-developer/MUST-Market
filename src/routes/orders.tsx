import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ClipboardList, ShoppingBag, Star, Utensils, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Footer } from "@/components/footer";
import { openAuthModal, useAuthUser } from "@/lib/auth-store";
import { fetchOrders, type FoodOrder } from "@/lib/orders";
import { fetchMyReviews, submitReview, type OrderReview } from "@/lib/reviews";
import { setCartItems } from "@/lib/cart";
import { formatTsh } from "@/lib/menu";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Recent Orders – MUST Food Fasta" },
      {
        name: "description",
        content:
          "Your recent MUST Food Fasta orders — reorder your favourite campus meals in one tap.",
      },
      { property: "og:title", content: "Recent Orders – MUST Food Fasta" },
      {
        property: "og:description",
        content: "View and reorder your past MUST Food Fasta orders.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://must-campus-swap.lovable.app/orders" }],
  }),
  component: OrdersPage,
});

function formatOrderDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLE: Record<string, string> = {
  delivered: "bg-emerald-100/60 text-emerald-600",
  pending: "bg-emerald-100/60 text-emerald-600",
  preparing: "bg-emerald-100/60 text-emerald-600",
  on_the_way: "bg-emerald-100/60 text-emerald-600",
  cancelled: "bg-slate-200/70 text-slate-500",
};

/** Customer-facing labels only — no live tracking wording. */
const STATUS_TEXT: Record<string, string> = {
  delivered: "Succeeded",
  pending: "Succeeded",
  preparing: "Succeeded",
  on_the_way: "Succeeded",
  cancelled: "Cancelled",
};

function OrdersPage() {
  const { user, initialized } = useAuthUser();

  const { data: orders, isLoading } = useQuery<FoodOrder[]>({
    queryKey: ["orders", user?.id ?? "anon"],
    queryFn: () => fetchOrders(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (initialized && !user) {
      openAuthModal("/orders");
    }
  }, [initialized, user]);

  if (initialized && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <TopBar />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <ClipboardList className="h-12 w-12 text-slate-300" />
          <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            You need to sign in to view your recent orders.
          </p>
          <button
            onClick={() => openAuthModal("/orders")}
            className="mt-6 rounded-full bg-[#2ECC71] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#27ae60]"
          >
            Sign In / Join
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6">
        <h1 className="mb-6 text-xl font-bold text-slate-900 md:text-2xl">
          Recent Orders
        </h1>

        {isLoading ? (
          <div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="mb-4 h-44 animate-pulse rounded-2xl border border-slate-200/90 bg-[#F8F9FA]"
              />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div>
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F8F9FA] p-10 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-900">
              No past orders found.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Start by ordering food from campus cafeterias.
            </p>
            <Link
              to="/msosi"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2ECC71] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#27ae60]"
            >
              <Utensils className="h-4 w-4" />
              Order Now
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function TopBar() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-3 px-4 sm:px-6">
        <button
          onClick={() => navigate({ to: "/msosi" })}
          className="grid h-9 w-9 place-items-center rounded-full text-slate-700 transition-colors hover:bg-slate-100"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-base font-bold tracking-tight text-slate-900">
          MUST Food Fasta
        </span>
      </div>
    </header>
  );
}

function OrderCard({
  order,
  userId,
  review,
}: {
  order: FoodOrder;
  userId: string;
  review?: OrderReview;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reviewOpen, setReviewOpen] = useState(false);
  const items = order.items ?? [];
  const title =
    items.length > 0
      ? items
          .map(
            (i) => i.name + (i.addSoda ? " + Soda" : ""),
          )
          .join(" + ")
      : "Order";
  const statusClass = STATUS_STYLE[order.status] ?? "bg-slate-200/70 text-slate-500";
  const statusText = STATUS_TEXT[order.status] ?? order.status;

  const handleReorder = () => {
    if (items.length === 0) {
      toast.error("This order has no items to reorder.");
      return;
    }
    setCartItems(items);
    toast.success("Order items added to checkout!");
    navigate({ to: "/msosi/checkout" });
  };

  return (
    <article className="shadow-2xs mb-4 space-y-3 rounded-2xl border border-slate-200/90 bg-[#F8F9FA] p-5 sm:bg-white">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-500">
          {formatOrderDate(order.created_at)}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
        >
          {statusText}
        </span>
      </div>

      <h2 className="text-lg font-bold text-slate-900">{title}</h2>

      <p className="text-lg font-bold text-slate-900 sm:text-xl">
        {formatTsh(order.total_tsh, "TZS")}
      </p>

      {review ? (
        <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2">
          <StarRow value={review.rating} />
          <span className="truncate text-xs text-slate-600">
            {review.comment || "Thanks for your rating!"}
          </span>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleReorder}
          className="w-full rounded-full bg-[#2ECC71] px-6 py-3.5 font-bold text-white shadow-sm transition-all hover:bg-[#27ae60] active:scale-[0.98]"
        >
          Reorder
        </button>
        <button
          type="button"
          onClick={() => setReviewOpen(true)}
          className="w-full rounded-full border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-700 transition-colors hover:border-[#008542] hover:text-[#008542]"
        >
          {review ? "Edit Review" : "Leave Review / Weka Maoni"}
        </button>
      </div>

      {reviewOpen ? (
        <ReviewModal
          orderId={order.id}
          userId={userId}
          existing={review}
          onClose={() => setReviewOpen(false)}
          onSaved={() => {
            void queryClient.invalidateQueries({ queryKey: ["order_reviews", userId] });
          }}
        />
      ) : null}
    </article>
  );
}

function StarRow({ value }: { value: number }) {
  return (
    <span className="flex shrink-0 items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${
            n <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"
          }`}
        />
      ))}
    </span>
  );
}

function ReviewModal({
  orderId,
  userId,
  existing,
  onClose,
  onSaved,
}: {
  orderId: string;
  userId: string;
  existing?: OrderReview;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await submitReview({ orderId, userId, rating, comment: comment.trim() });
      toast.success("Thank you! Your review has been sent. 🙌");
      onSaved();
      onClose();
    } catch {
      toast.error("Could not save your review. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        aria-label="Close review"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />
      <div className="relative w-full rounded-t-3xl border border-slate-200 bg-white p-6 shadow-xl sm:max-w-md sm:rounded-3xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">
              Leave a review
            </h3>
            <p className="text-[11px] text-slate-500">
              How was the food and the delivery?
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a short testimonial (optional)..."
          className="w-full resize-none rounded-2xl border border-slate-200 bg-[#FAFBF6] p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#008542] focus:outline-none focus:ring-2 focus:ring-[#008542]/15"
        />

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="mt-4 w-full rounded-full bg-[#008542] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#006e36] disabled:opacity-60"
        >
          {saving ? "Sending..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}
