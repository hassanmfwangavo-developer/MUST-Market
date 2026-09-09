import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/category-page";
import { canonical, MARKET_CATEGORY_PAGES } from "@/lib/site";

const meta = MARKET_CATEGORY_PAGES.electronics;

export const Route = createFileRoute("/market/electronics")({
  head: () => ({
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical(meta.path) },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical(meta.path) }],
  }),
  component: () => <CategoryPage slug="electronics" />,
});
