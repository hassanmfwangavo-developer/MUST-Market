DROP POLICY IF EXISTS "Anyone can view active market banners" ON public.market_banners;
CREATE POLICY "Guests can view active market banners"
  ON public.market_banners FOR SELECT TO anon
  USING (is_active = true);
CREATE POLICY "Members can view market banners"
  ON public.market_banners FOR SELECT TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.banners
  ADD COLUMN IF NOT EXISTS menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL;