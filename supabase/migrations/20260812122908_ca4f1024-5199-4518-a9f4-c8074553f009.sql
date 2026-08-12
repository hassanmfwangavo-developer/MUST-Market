GRANT SELECT (featured_shelf) ON public.products TO anon;
GRANT SELECT (featured_shelf), UPDATE (featured_shelf) ON public.products TO authenticated;