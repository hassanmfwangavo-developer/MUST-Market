import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://mustmarket.store";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC_ROUTES: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/market", changefreq: "daily", priority: "0.9" },
  { path: "/msosi", changefreq: "daily", priority: "0.9" },
  { path: "/services", changefreq: "weekly", priority: "0.8" },
  { path: "/careers", changefreq: "monthly", priority: "0.6" },
  { path: "/orders", changefreq: "daily", priority: "0.7" },
  { path: "/profile", changefreq: "weekly", priority: "0.6" },
  { path: "/sell", changefreq: "weekly", priority: "0.8" },
  { path: "/browse", changefreq: "daily", priority: "0.8" },
  { path: "/feedback", changefreq: "monthly", priority: "0.5" },
  { path: "/meet-the-founder", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "monthly", priority: "0.5" },
  { path: "/terms", changefreq: "monthly", priority: "0.5" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [...STATIC_ROUTES];

        // Marketplace product pages
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: products, error } = await supabaseAdmin
            .from("products")
            .select("id")
            .in("status", ["active", "sold"]);

          if (!error && products) {
            for (const product of products) {
              entries.push({
                path: `/product/${product.id}`,
                changefreq: "weekly",
                priority: "0.8",
              });
            }
          }

          // Msosi Fasta menu item pages
          const { data: menu, error: menuError } = await supabaseAdmin
            .from("menu_items")
            .select("id");

          if (!menuError && menu) {
            for (const item of menu) {
              entries.push({
                path: `/msosi/${item.id}`,
                changefreq: "weekly",
                priority: "0.7",
              });
            }
          }
        } catch (err) {
          console.error("[sitemap] Failed to fetch dynamic entries:", err);
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
