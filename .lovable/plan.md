# Make Streaks, Reward Points & Referrals 100% Functional

Currently all three features are cosmetic: the numbers are displayed but never earned, and the referral link's `?ref=` code is never processed. This plan wires them up with real, secure backend logic.

## 1. Daily Streak (🔥)

**Rule:** +1 streak day when a signed-in user places a food order on a new day. Miss a day → streak resets to 1.

- New server function `touchStreak()` (authenticated, in `src/lib/rewards.functions.ts`):
  - Reads the user's `last_order_date` (new column) and `current_streak`.
  - Same day → no change. Yesterday → streak + 1. Older → reset to 1.
- Called automatically after a successful checkout in `src/routes/msosi.checkout.tsx`.
- Profile page shows a toast like "🔥 3-day streak!" when it increases.

## 2. Reward Points

**Rule:** Earn **1 point per TSh 1,000 spent** on food orders (e.g. a TSh 8,500 order = 8 points).

- Migration: add `reward_points_awarded boolean` flag on `food_orders` to prevent double-awarding.
- Server function `awardOrderPoints(orderId)` runs after checkout: calculates points from `total_tsh`, adds them to `profiles.reward_points`, marks the order as awarded. Runs atomically so refresh/spam can't farm points.
- Points balance shown on the Profile page (already displayed) and a short line at checkout: "You'll earn ~8 points with this order."

## 3. Referral System

**Rule:** When a **new** user signs up via someone's `?ref=` link and places their **first paid order**, the inviter earns **50 points** + the invitee gets **10 welcome points**. Each inviter is credited only once per invited user.

- Migration: new `referrals` table (`id, inviter_id, invited_id, order_counted, created_at`) with RLS (users see only their own rows) + GRANTs; add `referred_by uuid` column on `profiles`.
- Capture: `src/routes/msosi.index.tsx` (and portal) reads `?ref=` on load, stores it in `localStorage`.
- Attribution: after sign-up/sign-in, an authenticated server function `claimReferral()` writes `referred_by` on the new user's profile (only if empty and not self-referral) and inserts a `referrals` row.
- Reward: when that user's first order completes, `awardOrderPoints` detects the pending referral, credits the inviter 50 points and invitee 10 points, marks `order_counted = true`.
- Profile page: referral card shows real stats — "X friends joined · Y points earned" from the `referrals` table.

## Security notes

- All point/streak mutations happen inside `requireSupabaseAuth` server functions — users cannot award themselves points from the browser.
- `profiles.reward_points` and `current_streak` get an RLS-safe trigger (`prevent_points_self_update`) so direct client updates to these columns are rejected; only server-side logic can change them.

## Files touched

- New: `src/lib/rewards.functions.ts` (thin server-fn wrappers), `src/lib/rewards.server.ts` (logic), DB migration (columns + `referrals` table + trigger).
- Updated: `src/routes/msosi.checkout.tsx` (call streak/points after payment), `src/routes/msosi.index.tsx` (capture `?ref=`), `src/routes/profile.tsx` (live referral stats, streak toast), auth flow hook (`claimReferral` after sign-in).

## Verification

- Typecheck + build pass.
- Browser test: place an order signed in → streak = 1, points increase by floor(total/1000).
- Open `?ref=<id>` in a fresh session, sign up, order → inviter profile shows +50 points and 1 friend joined.
