CREATE OR REPLACE FUNCTION public.increment_product_view(_product_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.products
  SET view_count = view_count + 1
  WHERE id = _product_id AND status = 'active';
$$;

REVOKE ALL ON FUNCTION public.increment_product_view(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_product_view(uuid) TO anon, authenticated, service_role;