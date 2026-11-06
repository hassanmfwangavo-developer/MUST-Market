ALTER TABLE public.order_reviews ALTER COLUMN user_id DROP NOT NULL;
CREATE OR REPLACE FUNCTION public.msosi_submit_review(_phone text, _order_id uuid, _rating int, _comment text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rid uuid;
BEGIN
  IF _rating < 1 OR _rating > 5 THEN RAISE EXCEPTION 'bad rating'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.food_orders f WHERE f.id = _order_id AND f.payment_status = 'success'
     AND length(public.msosi_phone_key(_phone)) = 9 AND public.msosi_phone_key(f.phone) = public.msosi_phone_key(_phone)) THEN
    RAISE EXCEPTION 'order not found';
  END IF;
  INSERT INTO public.order_reviews(order_id, user_id, rating, comment)
  VALUES (_order_id, auth.uid(), _rating, left(coalesce(_comment,''), 1000))
  ON CONFLICT (order_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
  RETURNING id INTO rid;
  RETURN rid;
END $$;
GRANT EXECUTE ON FUNCTION public.msosi_submit_review(text, uuid, int, text) TO anon, authenticated;