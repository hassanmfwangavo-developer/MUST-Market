CREATE TABLE public.preorder_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_tsh INTEGER NOT NULL DEFAULT 0 CHECK (price_tsh >= 0),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.preorder_meals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.preorder_meals TO authenticated;
GRANT ALL ON public.preorder_meals TO service_role;
ALTER TABLE public.preorder_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active preorder meals" ON public.preorder_meals FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage preorder meals" ON public.preorder_meals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.batch_preorders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_tsh INTEGER NOT NULL DEFAULT 0,
  batch_slot TEXT NOT NULL CHECK (batch_slot IN ('lunch','dinner')),
  hostel_zone TEXT NOT NULL CHECK (hostel_zone IN ('boys_6','girls_8','new_hostels')),
  customer_name TEXT NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 80),
  phone TEXT NOT NULL CHECK (char_length(phone) BETWEEN 9 AND 16),
  room TEXT NOT NULL CHECK (char_length(room) BETWEEN 1 AND 120),
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.batch_preorders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.batch_preorders TO authenticated;
GRANT ALL ON public.batch_preorders TO service_role;
ALTER TABLE public.batch_preorders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submits batch preorders" ON public.batch_preorders FOR INSERT TO anon, authenticated WITH CHECK (status = 'new' AND jsonb_array_length(items) BETWEEN 1 AND 20);
CREATE POLICY "Admins read batch preorders" ON public.batch_preorders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update batch preorders" ON public.batch_preorders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete batch preorders" ON public.batch_preorders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));