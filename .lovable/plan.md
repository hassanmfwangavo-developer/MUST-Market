# Why the food cards don't open

## Diagnosis

The click handlers are fine. The routing structure is the problem.

`src/routes/msosi.tsx` holds the whole food feed page, but because
`src/routes/msosi.$id.tsx` also exists, the router now treats `/msosi` as a
**parent layout** of `/msosi/$id`. A parent route must render `<Outlet />` for
its children to appear — `msosi.tsx` does not. So tapping a food card changes
the URL to `/msosi/<uuid>` but the screen keeps showing the feed and the
detail page never mounts. It looks like the card "does nothing".

Checked and ruled out:
- Card and green `+` button both call `openDish(food.id)` with correct
  `to="/msosi/$id"` + `params` — correct.
- The `menu_items` table has the 4 dishes with real UUIDs — data is fine.
- `/msosi/$id` route is registered in the generated route tree — fine.

## Fix

1. Create `src/routes/msosi.index.tsx` containing the current feed page
   (component + its `head()` metadata for `/msosi`).
2. Reduce `src/routes/msosi.tsx` to a thin layout that renders only
   `<Outlet />`, with no page body and no pathname checks.
3. Leave `src/routes/msosi.$id.tsx` unchanged; verify in the preview that
   tapping a card lands on the dish detail page with the right name, price,
   quantity selector and live total.

No database, styling, or business-logic changes.
