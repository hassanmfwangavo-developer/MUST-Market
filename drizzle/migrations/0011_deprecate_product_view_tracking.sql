COMMENT ON COLUMN public.products.view_count IS 'DEPRECATED: page-view tracking removed; column no longer read or written by the app.';
DROP FUNCTION IF EXISTS public.increment_product_view(uuid);