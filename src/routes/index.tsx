import { createFileRoute } from "@tanstack/react-router";
import { Portal } from "@/components/portal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MUST Market | Entrance Portal" },
      {
        name: "description",
        content:
          "MUST Market — soko la kuaminika la wanafunzi wa MUST. Nunua na uze vitu used sokoni, au agiza msosi kwa haraka. Chagua huduma uipendayo kuanza.",
      },
      { property: "og:title", content: "MUST Market — Marketplace & Msosi Fasta" },
      {
        property: "og:description",
        content:
          "The MUST Market portal — buy & sell student gear in the marketplace, or order food fast with Msosi Fasta.",
      },
      { property: "og:url", content: "https://must-campus-swap.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://must-campus-swap.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "MUST Market",
              url: "https://must-campus-swap.lovable.app/",
              description:
                "Multi-service portal for students at Mbeya University of Science and Technology: a peer-to-peer marketplace and Msosi Fasta express food delivery.",
            },
            {
              "@type": "WebSite",
              name: "MUST Market",
              url: "https://must-campus-swap.lovable.app/",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://must-campus-swap.lovable.app/browse?q={search_term_string}",
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
