# Vendor-based Msosi menus

## Build
- Replace the current restaurant logo marquee on `/msosi` with a mobile-first “Migahawa Maarufu Chuoni” card section. Each card links to its restaurant page and shows its logo, name, location, and hours.
- Add `/msosi/vendor/$id` with a clear back link, restaurant contact and supported drop-off zones, then group that restaurant’s available menu items into Mchana, Usiku, and Vinywaji / Extras.
- Give every available meal two actions: “Pre-Order (Delivery)” opens a batch-order dialog prefilled with that meal, while “Book / Weka Akiba” opens a quick dine-in/pickup reservation dialog with arrival time.
- Extend restaurant administration so location, hours, contact, and drop-off zones remain editable rather than hardcoded.

## Data and safety
- Add optional restaurant detail fields to existing vendors and an optional vendor link to batch pre-orders; preserve all current rows and policies.
- Store selected restaurant ownership with delivery pre-orders so vendor/admin views can remain correctly scoped.
- Reuse the current booking and batch-order tables, notification flow, phone validation, and active/sold-out menu controls. Regular checkout remains unchanged.

## Validation
- Test restaurant cards, direct/back navigation, grouped vendor menus, sold-out states, delivery pre-order submission, dine-in/pickup booking, both phone and desktop layouts, metadata, and the final build.
