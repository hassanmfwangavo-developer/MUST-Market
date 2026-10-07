import { createFileRoute } from "@tanstack/react-router";
import { PreorderPage } from "@/components/preorder-page";

export const Route = createFileRoute("/msosi/preorder")({
  head: () => ({
    meta: [
      { title: "Hostel Meal Pre-Order — Msosi Fasta" },
      { name: "description", content: "Reserve meals for a scheduled Msosi Fasta hostel delivery batch." },
      { property: "og:title", content: "Hostel Meal Pre-Order — Msosi Fasta" },
      { property: "og:description", content: "Pre-order lunch or dinner for delivery to your MUST hostel zone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PreorderPage,
});