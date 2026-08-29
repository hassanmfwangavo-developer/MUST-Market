# Fix admin banner/category upload authorization

## Confirmed diagnosis

- The recent database errors explicitly say: `new row violates row-level security policy for table "objects"`.
- Banner/category records are not the failing rows; the image upload fails first, before either record is created.
- The storage policy only accepts paths shaped like `<signed-in-user-id>/...`.
- The admin uploader currently creates paths shaped like `banners/<random-file>` and `category-icons/<random-file>`, so every image upload violates that policy.
- The admin database role, banner/category table permissions, and `has_role()` execution grants are present. The earlier function-permission fix was valid but did not address this separate storage-path mismatch.
- The currently responding preview tab has no active auth session. Admin writes must also fail clearly when the session has expired instead of displaying the same raw database warning.

## Implementation

1. **Align uploads with the secure storage policy**
   - Require a valid signed-in user inside the admin upload helper.
   - Save admin images under `<user-id>/banners/...` or `<user-id>/category-icons/...`.
   - Keep the bucket private and continue generating signed display URLs; do not weaken storage access to unrestricted uploads.

2. **Make authentication failures clear**
   - Before an admin mutation, verify that the session exists and that the database-backed admin role is available.
   - Replace the raw row-security warning with a clear “session expired—sign in again” or “administrator access required” message as appropriate.
   - Keep database RLS as the final authority; the email-only route check will not be treated as authorization.

3. **Prevent partial and confusing submissions**
   - Distinguish image-upload errors from banner/category record errors.
   - If the image succeeds but the record write fails, remove the newly uploaded file so storage is not left with orphaned images.

4. **Verify both workflows end to end**
   - Confirm the signed-in admin can upload an image and create a banner.
   - Confirm the signed-in admin can upload an icon and create a category.
   - Confirm signed-out and non-admin attempts remain blocked with understandable messages.
   - Recheck database logs to ensure no new storage row-policy violations occur.

## Technical details

- Primary code change: the shared admin media uploader and the two admin mutation flows.
- No public bucket, anonymous upload policy, or broad admin-email bypass will be introduced.
- Existing banner/category RLS policies remain role-based through `user_roles` and `has_role()`.