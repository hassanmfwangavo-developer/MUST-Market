import { createFileRoute } from "@tanstack/react-router";
import { PreorderPage } from "@/components/preorder-page";

export const Route = createFileRoute("/preorder")({
  head: () => ({
    meta: [
      { title: "Batch Pre-Order — Msosi Fasta" },
      { name: "description", content: "Pre-order meals for the Msosi Fasta lunch or dinner hostel delivery batch." },
      { property: "og:title", content: "Batch Pre-Order — Msosi Fasta" },
      { property: "og:description", content: "Choose a meal, delivery batch and MUST hostel drop zone in advance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PreorderPage,
});