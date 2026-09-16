# Campus Service Mall

## Goal
Add a polished public `/services` directory where MUST students can browse trusted campus service providers, filter by category, inspect pricing and portfolios, and contact providers directly.

## Build
- Create a dedicated `/services` page with route-specific search and social metadata.
- Add a responsive heading and horizontally scrollable category filters for all requested service types.
- Add a curated starter directory of local-style provider cards with cover imagery, verified status, ratings, locations, top services, starting prices, profile actions, and pre-filled WhatsApp enquiries.
- Add a responsive provider profile dialog with bio, operating hours, full pricing, portfolio gallery, call, and WhatsApp actions.
- Add the bottom onboarding banner and a compact registration dialog that validates details and sends a structured application to `255674044676` on WhatsApp.
- Add “Service Mall” to shared site navigation so the page is discoverable.

## Visual direction
Use the existing off-white, emerald, and amber MUST Market system. Cards stay crisp and editorial with compact information hierarchy, consistent imagery, restrained shadows, and mobile-first actions.

## Technical details
- Keep provider content as typed local display data; no database or admin workflow is added.
- Reuse the existing Button and Dialog primitives, semantic design tokens, Navbar, Footer, and toast system.
- Use bundled/generated images rather than remote hotlinks.
- Verify filtering, both dialogs, WhatsApp/call links, desktop layout, and mobile layout in the running preview.
