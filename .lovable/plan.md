# Fix: Desktop payment banner covers the checkout form

## Problem

On desktop, the fixed full-width payment bar (`fixed bottom-0 ... z-50`) sits on top of the page content and overlaps the last form field — "Jina la Gheto / Namba ya Chumba" — so users can't fill it. The mobile experience is fine; only desktop is broken because a mobile-style fixed bar doesn't belong on a two-column desktop layout.

## Fix (one file: `src/routes/msosi.checkout.tsx`)

Make the payment CTA behave differently on mobile vs desktop:

1. **Mobile (keep as-is):** The fixed sticky bottom bar stays — it's the right pattern for thumb-reach checkout on phones. Add `md:hidden` to the fixed bar container so it disappears on desktop.

2. **Desktop (new inline button):** Add an in-flow "Lipa Sasa" button at the bottom of the right-column form section (`hidden md:block`), so it sits naturally after the Delivery Location card instead of floating over it.

3. **Bottom padding:** Change the content container's `pb-28` to `pb-28 md:pb-12` so desktop doesn't keep the large mobile padding meant to clear the fixed bar.

4. **No logic changes:** The same `handlePay` handler and `submitting` state drive both buttons; just two instances of the same button, one per layout.

## Verification

- Open `/msosi/checkout` on desktop viewport → the "Jina la Gheto" field is fully visible and fillable; the "Lipa Sasa" button appears inline below the form, not floating over it.
- Switch to mobile viewport → the fixed sticky bottom bar is still present and unchanged.
