CREATE TABLE public.msosi_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_key text NOT NULL UNIQUE,
  phone text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  total_orders integer NOT NULL DEFAULT 0,
  last_order_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.msosi_customers TO authenticated;
GRANT ALL ON public.msosi_customers TO service_role;
ALTER TABLE public.msosi_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read msosi customers" ON public.msosi_customers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete msosi customers" ON public.msosi_customers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.msosi_phone_key(_phone text) RETURNS text
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT right(regexp_replace(coalesce(_phone,''), '\D', '', 'g'), 9)
$$;

CREATE OR REPLACE FUNCTION public.upsert_msosi_customer(_phone text, _name text, _location text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE k text := public.msosi_phone_key(_phone);
BEGIN
  IF length(k) < 9 THEN RETURN; END IF;
  INSERT INTO public.msosi_customers(phone_key, phone, full_name, location, total_orders, last_order_at)
  VALUES (k, '0' || k, coalesce(_name,''), coalesce(_location,''), 1, now())
  ON CONFLICT (phone_key) DO UPDATE SET
    full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE msosi_customers.full_name END,
    location = CASE WHEN EXCLUDED.location <> '' THEN EXCLUDED.location ELSE msosi_customers.location END,
    total_orders = msosi_customers.total_orders + 1,
    last_order_at = now();
END $$;
REVOKE ALL ON FUNCTION public.upsert_msosi_customer(text,text,text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.capture_msosi_customer() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'food_orders' THEN
    PERFORM public.upsert_msosi_customer(NEW.phone, NEW.customer_name, trim(NEW.delivery_area || ' ' || NEW.room));
  ELSIF TG_TABLE_NAME = 'batch_preorders' THEN
    PERFORM public.upsert_msosi_customer(NEW.phone, NEW.customer_name, trim(NEW.hostel_zone || ' ' || NEW.room));
  ELSE
    PERFORM public.upsert_msosi_customer(NEW.phone_number, NEW.customer_name, NEW.delivery_location);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER capture_customer_food AFTER INSERT ON public.food_orders FOR EACH ROW EXECUTE FUNCTION public.capture_msosi_customer();
CREATE TRIGGER capture_customer_batch AFTER INSERT ON public.batch_preorders FOR EACH ROW EXECUTE FUNCTION public.capture_msosi_customer();
CREATE TRIGGER capture_customer_pre AFTER INSERT ON public.msosi_pre_orders FOR EACH ROW EXECUTE FUNCTION public.capture_msosi_customer();

CREATE OR REPLACE FUNCTION public.msosi_orders_by_phone(_phone text)
RETURNS TABLE(id uuid, kind text, items jsonb, total_tsh integer, status text, created_at timestamptz, summary text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH k AS (SELECT public.msosi_phone_key(_phone) AS key)
  SELECT f.id, 'paid', f.items, f.total_tsh, f.status, f.created_at, NULL
    FROM public.food_orders f, k WHERE length(k.key) = 9 AND public.msosi_phone_key(f.phone) = k.key AND f.payment_status = 'success'
  UNION ALL
  SELECT b.id, 'preorder', b.items, b.total_tsh, b.status, b.created_at, b.batch_slot
    FROM public.batch_preorders b, k WHERE length(k.key) = 9 AND public.msosi_phone_key(b.phone) = k.key
  UNION ALL
  SELECT p.id, 'preorder', jsonb_build_array(jsonb_build_object('name', p.item_name, 'quantity', 1, 'price', 0)), 0, p.status, p.created_at, p.scheduled_for
    FROM public.msosi_pre_orders p, k WHERE length(k.key) = 9 AND public.msosi_phone_key(p.phone_number) = k.key
  ORDER BY created_at DESC LIMIT 50
$$;
GRANT EXECUTE ON FUNCTION public.msosi_orders_by_phone(text) TO anon, authenticated;