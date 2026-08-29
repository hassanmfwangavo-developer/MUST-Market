CREATE TABLE public.user_claimed_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banner_id uuid REFERENCES public.banners(id) ON DELETE SET NULL,
  promo_code text,
  discount_percent integer NOT NULL DEFAULT 0,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_claimed_offers TO authenticated;
GRANT ALL ON public.user_claimed_offers TO service_role;
ALTER TABLE public.user_claimed_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own claimed offers" ON public.user_claimed_offers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_claimed_offers_user ON public.user_claimed_offers(user_id);