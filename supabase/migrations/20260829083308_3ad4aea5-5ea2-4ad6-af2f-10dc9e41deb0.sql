GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_product_view(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.increment_whatsapp_click(uuid) TO authenticated, anon;