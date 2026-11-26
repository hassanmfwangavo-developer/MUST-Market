# Order notifications
- [x] Add year-long listing-upload caching and lazy/async product/menu images without editing payment or SMS files; verified a temporary listing-edit upload's stored cache header and removed the photo without saving a listing.
- [x] Paginate public Sokoni summary queries in 16-row pages with usable filtering and load-more controls; verified 16 then 32 distinct listings, database category filters, search and phone layouts.
- [x] Throttle login streak updates per user per day in localStorage; verified account switches/retries in tests and zero streak calls on a signed-in reload; 21 targeted tests passed.
- [x] Audit database reads and live subscriptions; remove polling, verify five-minute catalog caching and scoped paid-order updates; pre-orders use manual refresh because their tables are not live-enabled.
- [x] Compress listing creation/edit and food/pre-order photo uploads; verified four rules and a real food photo upload with cleanup.
- [x] Add admin phone registration with enable/disable/test controls.
- [x] Connect notifications to paid food orders and both pre-order flows; preserve emails and payment outcomes.
- [x] Verify credential access, payload rules (six tests), signed-in admin control, permission denial and embedded preview guidance.
- [ ] Confirm delivery on Hassani's phone: requires opening the published app, allowing notifications and pressing Jaribu arifa; no real phone registration is available in the sandbox.