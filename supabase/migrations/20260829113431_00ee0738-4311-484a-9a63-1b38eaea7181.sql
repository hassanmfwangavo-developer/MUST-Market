CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vendors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors are viewable by everyone" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Admins can insert vendors" ON public.vendors FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update vendors" ON public.vendors FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete vendors" ON public.vendors FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.menu_items
  ADD COLUMN vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  ADD COLUMN addons jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.food_orders
  ADD COLUMN payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN customer_name text NOT NULL DEFAULT '';

CREATE POLICY "Admins can view all food orders" ON public.food_orders FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update food orders" ON public.food_orders FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

INSERT INTO public.vendors (name, is_featured, display_order)
SELECT DISTINCT vendor_name, true, 0 FROM public.menu_items WHERE vendor_name <> '';

UPDATE public.menu_items m SET vendor_id = v.id FROM public.vendors v WHERE v.name = m.vendor_name;