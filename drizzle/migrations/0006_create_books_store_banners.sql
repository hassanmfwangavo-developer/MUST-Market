CREATE TABLE public.books_store_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot INTEGER NOT NULL UNIQUE CHECK (slot BETWEEN 1 AND 3),
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.books_store_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books_store_banners TO authenticated;
GRANT ALL ON public.books_store_banners TO service_role;
ALTER TABLE public.books_store_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view books store banners" ON public.books_store_banners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage books store banners" ON public.books_store_banners FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));