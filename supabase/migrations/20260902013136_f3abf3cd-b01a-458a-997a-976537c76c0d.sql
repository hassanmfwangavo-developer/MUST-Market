CREATE TABLE public.market_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  image_path TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.market_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_banners TO authenticated;
GRANT ALL ON public.market_banners TO service_role;

ALTER TABLE public.market_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active market banners"
ON public.market_banners FOR SELECT TO anon, authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage market banners"
ON public.market_banners FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));