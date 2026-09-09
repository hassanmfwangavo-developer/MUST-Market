import { createFileRoute } from "@tanstack/react-router";
import { Portal } from "@/components/portal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MUST Market | Mbeya University Super Campus App" },
      {
        name: "description",
        content:
          "MUST Market is the student marketplace and campus food service for Mbeya University of Science and Technology. Buy and sell used items, find rooms and study supplies, or order Msosi Fasta.",
      },
      { property: "og:title", content: "MUST Market — Marketplace & Msosi Fasta" },
      {
        property: "og:description",
        content:
          "The MUST Market portal — buy & sell student gear in the marketplace, or order food fast with Msosi Fasta.",
      },
      { property: "og:url", content: "https://www.mustmarket.store/" },
    ],
    links: [{ rel: "canonical", href: "https://www.mustmarket.store/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "MUST Market",
              url: "https://www.mustmarket.store/",
              description:
                "Multi-service portal for students at Mbeya University of Science and Technology: a peer-to-peer marketplace and Msosi Fasta express food delivery.",
            },
            {
              "@type": "WebSite",
              name: "MUST Market",
              url: "https://www.mustmarket.store/",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.mustmarket.store/browse?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <Portal />;
}
