# SEO, Canonical Domain and Category Pages Overhaul

Make **https://www.mustmarket.store** the single official address of the site, clean up what search engines are told to index, add four permanent category pages, and tighten the home, founder and Msosi page wording.

## 1. One official web address everywhere

Replace every leftover `must-campus-swap.lovable.app` and bare `mustmarket.store` reference with `https://www.mustmarket.store` across all pages: home, marketplace, browse, sell, product pages, Msosi, orders, profile, feedback, meet the founder, privacy, terms, plus the site-wide share image and the search action in the structured data. Every page keeps its own self-referencing address.

Also updated: the referral share link on the Msosi page and the profile share link, so invites use the official address.

## 2. Search engine files

- `robots.txt` points to `https://www.mustmarket.store/sitemap.xml`.
- Sitemap entries all use the official address.
- Remove private/transactional pages from the sitemap: `/orders`, `/profile`, `/sell`, `/feedback` stays only if you want it public (kept), and `/admin`, `/dashboard` are already excluded. Keep home, marketplace, Msosi, browse, the new category pages, founder, privacy, terms, active product pages and Msosi dish pages.
- Add `noindex, follow` to `/browse` (a search/filter screen), and to `/orders`, `/profile`, `/dashboard`, `/admin`, checkout and order-success pages.

## 3. Home page

- Title: "MUST Market | Mbeya University Super Campus App"
- Description: the student marketplace and campus food service wording from the brief.
- Main heading becomes "MUST Market for Mbeya University Students" (kept visually in the current hero style, with the current "Karibu MUST Market" line moved to the supporting text).
- Header navigation gets real crawlable links to Marketplace, Msosi Fasta and Meet the Founder.

## 4. Footer link honesty

Rework the footer so each label goes where it says: rename "Campus Life & Tips", "Tech & Coding", "Must Foodie Reviews", "Careers", "Affiliates & Ambassadors" and "News & Updates" into labels matching their real destinations (marketplace categories, Msosi, feedback/contact), and point the category labels at the new permanent category pages.

## 5. Four permanent category pages

New pages, each a full listing experience pre-filtered to its category, with its own heading, short intro paragraph, title, description and self-referencing address:

- `/market/electronics` — "Used Electronics at MUST Market | Mbeya University"
- `/market/rooms-gheto` — "Rooms & Gheto Near MUST | MUST Market"
- `/market/books-stationery` — "Books & Study Supplies | MUST Market"
- `/market/used-items` — "Buy & Sell Used Items at MUST | MUST Market"

Category pills on the marketplace and the footer link to these pages. `/browse?category=...` keeps working, but is no longer the indexed version.

## 6. Founder and Msosi pages

- Founder page: title "Meet Hassani Mfwangavo, Founder of MUST Market", heading "Hassani Mfwangavo — Founder of MUST Market", plus Person and Organization structured data on the official address.
- Msosi page: title "Msosi Fasta | Campus Food Delivery at Mbeya University", heading "Order Food from MUST Campus Cafeterias".

## Technical notes

- Introduce `src/lib/site.ts` exporting `SITE_URL = "https://www.mustmarket.store"` and a `canonical(path)` helper; every route `head()` uses it instead of hardcoded strings, so a future domain change is one edit.
- `/market` becomes a layout route rendering `<Outlet />`; current marketplace body moves to `src/routes/market.index.tsx`. New leaves: `market.electronics.tsx`, `market.rooms-gheto.tsx`, `market.books-stationery.tsx`, `market.used-items.tsx`, each reusing the existing product grid/filter components with a fixed category and a shared category-page component.
- Category slug ↔ stored category-name mapping lives in one module so admin category names stay the source of truth.
- Sitemap route: swap `BASE_URL`, drop private paths, add the four category paths, keep the dynamic product and dish queries.
- No database or business-logic changes.

## One thing to confirm on your side

The domain check shows **no custom domain connected to this project and the project not yet published**. The addresses above are still the right thing to bake in, but search engines will only see them once `www.mustmarket.store` is connected here and the project is published.
