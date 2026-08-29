# Fix: "new row violates row-level security policy" when publishing banners/categories

## Diagnosis (confirmed against the live database)

- Your admin account (`hmbusiness49@gmail.com`) **does** have the `admin` role in `user_roles` — that part is fine.
- Table grants on `banners`, `food_categories`, and `user_roles` are also fine.
- The real problem: the database function `has_role()` — which every admin policy uses to decide "is this person an admin?" — is **missing its EXECUTE permission**. When the database checks the policy during your insert, it is not allowed to run `has_role()`, the check fails, and Postgres reports it as "new row violates row-level security policy".
- Verified directly: running `has_role(...)` from the API returns `42501: permission denied for function has_role`.

## Fix

One small migration that grants permission to run the security functions:

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_product_view(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.increment_whatsapp_click(uuid) TO authenticated, anon;
```

(The two `increment_*` functions are used when buyers view products / tap WhatsApp — granting them too prevents the same class of error there.)

## Verification

After the migration is approved, I'll run `has_role()` via the API to confirm it returns `true` for your admin account, then you can retry publishing a banner — it should succeed.
