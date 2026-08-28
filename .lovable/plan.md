# Fix & modernize the Msosi Fasta dish title header

## Problem (confirmed from screenshot + code)
On the dish detail page (`src/routes/msosi.$id.tsx`), the food title **"Chips Kuku" overlaps the bottom of the hero image** and looks cramped/unstyled.

Root cause in the current markup:
- A decorative sheet `<div className="relative z-10 -mt-4 rounded-t-3xl bg-[#FAFBF6]" />` pulls up 4 units into the image but has **no padding**.
- The `<main>` content then uses another **`-mt-2`** on the title row, pulling the title *above* the sheet — so it lands on top of the image with effectively negative spacing.

## Fix — restructure the hero→content transition into a proper overlapping sheet
Replace the empty decorative sheet + negative-margin title with a single content sheet that overlaps the image cleanly and gives the title real breathing room:

1. **Hero image block** stays `h-[280px] md:h-[350px]`, with the existing top gradient + floating back/favorite buttons.
2. **Content sheet** = one container that:
   - Overlaps the image by ~24px: `-mt-6 rounded-t-3xl bg-[#FAFBF6]`
   - Has `pt-6 px-4 pb-32` so the title sits *inside* the sheet with proper top padding (no overlap).
   - Keeps `relative z-10` so it layers above the image.
3. **Title row** (inside the sheet) — modernize typography & layout:
   - Title: `text-2xl font-extrabold tracking-tight text-slate-900` (keep), add `leading-tight`.
   - Vendor line directly below: `text-sm text-slate-500` with a subtle map-pin icon for polish.
   - Price tag: keep amber pill, but align baseline with title via `items-center` and `shrink-0`.
   - Remove the stray `-mt-2` entirely (the cause of the overlap).
4. **Badges row** unchanged (already fine) — just ensure `mt-4` spacing from the title.

No logic, routing, query, or add-on/checkout changes — this is a layout/typography fix on one file.

## Files to edit
- `src/routes/msosi.$id.tsx` — restructure lines ~88–155 (hero image + sheet + title + badges). Leave the add-ons, notes, and bottom action bar untouched.

## Verification
- Re-open a dish page in the preview (mobile viewport) and screenshot it: the title must sit fully *below* the image with clear whitespace, no clipping, and the amber price pill aligned to the right of the title.
- Confirm desktop (md) layout still looks clean.
