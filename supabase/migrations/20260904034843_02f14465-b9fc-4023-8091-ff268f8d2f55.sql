ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS day_badge text;

CREATE TABLE public.msosi_pre_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name text NOT NULL DEFAULT '',
  customer_name text NOT NULL DEFAULT '',
  phone_number text NOT NULL DEFAULT '',
  delivery_location text NOT NULL DEFAULT '',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.msosi_pre_orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.msosi_pre_orders TO authenticated;
GRANT ALL ON public.msosi_pre_orders TO service_role;

ALTER TABLE public.msosi_pre_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create pre-orders"
  ON public.msosi_pre_orders FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view pre-orders"
  ON public.msosi_pre_orders FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pre-orders"
  ON public.msosi_pre_orders FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pre-orders"
  ON public.msosi_pre_orders FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_msosi_pre_orders_updated
  BEFORE UPDATE ON public.msosi_pre_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();