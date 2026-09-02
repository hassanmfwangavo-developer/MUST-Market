-- Security foundation for provider-backed food payments.
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_order_id uuid NOT NULL REFERENCES public.food_orders(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_order_id text,
  provider_reference text,
  transaction_id text,
  amount_tsh integer NOT NULL CHECK (amount_tsh > 0),
  currency text NOT NULL DEFAULT 'TZS' CHECK (currency = 'TZS'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  raw_provider_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  webhook_event_id text,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX payments_provider_order_unique
  ON public.payments(provider, provider_order_id)
  WHERE provider_order_id IS NOT NULL;
CREATE UNIQUE INDEX payments_provider_reference_unique
  ON public.payments(provider, provider_reference)
  WHERE provider_reference IS NOT NULL;
CREATE UNIQUE INDEX payments_transaction_unique
  ON public.payments(provider, transaction_id)
  WHERE transaction_id IS NOT NULL;
CREATE UNIQUE INDEX payments_webhook_event_unique
  ON public.payments(provider, webhook_event_id)
  WHERE webhook_event_id IS NOT NULL;
CREATE INDEX payments_food_order_idx ON public.payments(food_order_id);
CREATE UNIQUE INDEX payments_one_active_per_order_unique
  ON public.payments(food_order_id)
  WHERE status = 'pending';

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.food_orders
  ADD COLUMN IF NOT EXISTS checkout_request_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS food_orders_user_checkout_request_unique
  ON public.food_orders(user_id, checkout_request_id)
  WHERE checkout_request_id IS NOT NULL;

CREATE POLICY "Users can view payments for their own orders"
ON public.payments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.food_orders
    WHERE food_orders.id = payments.food_order_id
      AND food_orders.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users manage their own food orders" ON public.food_orders;
CREATE POLICY "Users can view their own food orders"
ON public.food_orders FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update delivery details on their own orders"
ON public.food_orders FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

REVOKE INSERT, UPDATE, DELETE ON public.food_orders FROM authenticated;
GRANT UPDATE (delivery_area, room, phone, customer_name) ON public.food_orders TO authenticated;

-- Existing checkout supports a soda add-on. Make its price database-controlled.
UPDATE public.menu_items
SET addons = addons || jsonb_build_array(jsonb_build_object(
  'title', 'Soda (Azam/Coca-Cola)',
  'price', 1000
))
WHERE NOT EXISTS (
  SELECT 1
  FROM jsonb_array_elements(CASE WHEN jsonb_typeof(addons) = 'array' THEN addons ELSE '[]'::jsonb END) addon
  WHERE lower(COALESCE(addon->>'title', '')) LIKE '%soda%'
);
