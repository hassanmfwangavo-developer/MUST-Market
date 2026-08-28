CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price integer NOT NULL,
  vendor_name text NOT NULL DEFAULT '',
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  image_url text,
  category text NOT NULL DEFAULT 'Zote',
  prep_time text NOT NULL DEFAULT '15-20 min',
  is_popular boolean NOT NULL DEFAULT false,
  description text NOT NULL DEFAULT '',
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.menu_items TO anon;
GRANT SELECT ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Menu items are viewable by everyone" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Admins can insert menu items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update menu items" ON public.menu_items FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete menu items" ON public.menu_items FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.menu_items (name, price, vendor_name, rating, image_url, category, prep_time, is_popular, description) VALUES
('Chips Kuku', 7500, 'Mama Lishe, MUST Cafeteria', 4.8, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80', 'Chips / Fast Food', '15-20 min', true, 'Chips kavu za dhahabu zilizokaangwa vizuri, pamoja na kuku wa kuchoma wenye viungo vya asili na kachumbari safi.'),
('Chicken Biryani', 4500, 'Swahili Kitchen — Ikuti', 4.9, 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80', 'Wali / Biryani', '20-25 min', true, 'Biryani ya kuku iliyopikwa kwa viungo vya pwani, mchele mtamu na saladi.'),
('Wali Nyama / Maharage', 3500, 'Cafeteria Block E', 4.6, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', 'Ugali / Swahili', '10-15 min', false, 'Wali mweupe pamoja na nyama au maharage, mchuzi mzito na mboga za majani.'),
('Chips Mayai Extra', 3000, 'Joji Fast Food', 4.7, 'https://images.unsplash.com/photo-1584947898604-1b11606d5022?w=600&q=80', 'Chips / Fast Food', '10-15 min', false, 'Chips mayai maalum na mayai matatu, kachumbari na pilipili ya kienyeji.');