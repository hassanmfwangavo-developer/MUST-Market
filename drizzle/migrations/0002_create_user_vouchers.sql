CREATE TABLE public.user_vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'free_soda',
  is_used boolean NOT NULL DEFAULT false,
  used_at timestamptz,
  order_id uuid REFERENCES public.food_orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX user_vouchers_user_idx ON public.user_vouchers (user_id, is_used);

GRANT SELECT, UPDATE ON public.user_vouchers TO authenticated;
GRANT ALL ON public.user_vouchers TO service_role;

ALTER TABLE public.user_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own vouchers" ON public.user_vouchers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users redeem own vouchers" ON public.user_vouchers
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);