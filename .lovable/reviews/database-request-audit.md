# Database request audit

## Changes
- Removed admin metrics' 30-second polling (five count requests per cycle) and vendor orders' 60-second polling.
- Disabled automatic focus/reconnect refetch and interval polling globally; operational queries remain stale after one minute and refresh on subsequent visits or explicit actions.
- Public menus, dishes, vendor menus, marketplace listings/details, banners, categories, pre-order meals, events and services reuse cached data for five minutes; inactive cache retention is 30 minutes, scoped to the current browser app session.
- Removed all shorter per-page catalog overrides. Marketplace views continue sharing the same list query, and detail queries share its invalidation prefix.
- Shared user-keyed portal access (one minute), profile and voucher reads across navigation, account, checkout and admin/vendor views.
- Cancelled and reset query caches and refreshed router data on identity changes; token refresh alone does not refetch all data.
- Corrected menu/vendor/banner/category mutation invalidations so local edits do not wait five minutes to appear. Removed an all-query invalidation after pinning a listing.
- Menu/network failures are no longer cached as successful empty menus.

## Live subscriptions
- One unique paid-order channel per mounted vendor portal, filtered by selected vendor when applicable.
- Only INSERT/UPDATE events; one-second burst coalescing, exact query invalidation, reconnect recovery and full channel/timer cleanup.
- Publication inspection confirmed only `food_orders` is live-enabled among the three order tables. Removed ineffective pre-order subscriptions; the new Refresh orders control updates paid and pre-order queues on demand. No database/publication/security changes were made.

## Deliberately preserved
- Payment submission validates current menu availability/prices with fresh reads; cached catalog data never replaces this check.
- The bounded payment-provider confirmation loop runs only after payment submission; it is not background database polling.
- Carousel/countdown timers only change local UI state and do not read the database.
- Action-driven writes/notification/rewards processing, sitemap caching, and backend authorization remain unchanged.
- Full reloads create a new in-memory query cache; caching is not persisted on disk.

## Verification
- Cache expiry, mutation invalidation, disabled automatic refetch and shorter order freshness tested with concrete timings.
- Vendor subscription scope, event types, burst coalescing, channel uniqueness, cleanup and reconnect behavior tested.
- Signed-in browser navigation showed zero additional list/menu reads when revisiting after 35 seconds; vendor portal showed zero periodic order reads after 65 seconds.
- Production request-volume reductions and delivery of a new real paid-order event were not measured; no live orders were created or changed for testing.