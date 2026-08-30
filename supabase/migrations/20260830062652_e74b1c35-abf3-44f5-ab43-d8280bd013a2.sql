ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS delivery_fee integer NOT NULL DEFAULT 1000;

CREATE TABLE IF NOT EXISTS public.order_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.food_orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_reviews TO authenticated;
GRANT ALL ON public.order_reviews TO service_role;

ALTER TABLE public.order_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own reviews" ON public.order_reviews
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reviews" ON public.order_reviews
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));