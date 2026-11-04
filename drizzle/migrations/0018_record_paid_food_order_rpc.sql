CREATE UNIQUE INDEX IF NOT EXISTS food_orders_payment_reference_key ON public.food_orders (payment_reference) WHERE payment_reference IS NOT NULL;

CREATE OR REPLACE FUNCTION public.record_paid_food_order(
  _reference text, _items jsonb, _total integer, _area text, _room text, _phone text, _name text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN
  IF coalesce(length(_reference),0) < 4 OR _total <= 0 THEN RAISE EXCEPTION 'invalid order'; END IF;
  SELECT id INTO new_id FROM public.food_orders WHERE payment_reference = _reference;
  IF new_id IS NOT NULL THEN RETURN new_id; END IF;
  INSERT INTO public.food_orders (user_id, items, total_tsh, delivery_area, room, phone, customer_name, payment_status, payment_reference, status)
  VALUES (auth.uid(), coalesce(_items,'[]'::jsonb), _total, left(coalesce(_area,''),120), left(coalesce(_room,''),120), left(coalesce(_phone,''),20), left(coalesce(_name,''),120), 'success', _reference, 'delivered')
  RETURNING id INTO new_id;
  RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION public.record_paid_food_order(text,jsonb,integer,text,text,text,text) FROM public;
GRANT EXECUTE ON FUNCTION public.record_paid_food_order(text,jsonb,integer,text,text,text,text) TO anon, authenticated, service_role;