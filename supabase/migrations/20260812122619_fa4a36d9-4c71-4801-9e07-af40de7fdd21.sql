ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured_shelf text;

CREATE TABLE public.homepage_shelves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shelf_key text NOT NULL UNIQUE,
  display_name text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  category text,
  position_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.homepage_shelves TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_shelves TO authenticated;
GRANT ALL ON public.homepage_shelves TO service_role;

ALTER TABLE public.homepage_shelves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shelves are viewable by everyone"
  ON public.homepage_shelves FOR SELECT USING (true);

CREATE POLICY "Admins can insert shelves"
  ON public.homepage_shelves FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update shelves"
  ON public.homepage_shelves FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete shelves"
  ON public.homepage_shelves FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_homepage_shelves_updated
  BEFORE UPDATE ON public.homepage_shelves
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.homepage_shelves (shelf_key, display_name, subtitle, category, position_order) VALUES
  ('hot_deals', '🔥 Hot Deals', 'Lowest prices on campus right now', NULL, 1),
  ('rooms', '🏠 Vyumba & Gheto', 'Rooms, hostel space & accommodation', 'Rooms / Gheto', 2),
  ('freshers_pack', '🎓 Freshers Starter Pack', 'Kettles, laptops, desks, beds & essentials', 'Room/Hostel Gear', 3),
  ('trending', '⚡ Trending Tech', 'Most viewed gadgets & electronics', 'Electronics', 4);