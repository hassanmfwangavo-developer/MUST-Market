CREATE TABLE IF NOT EXISTS public.food_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_tsh integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  delivery_area text NOT NULL DEFAULT '',
  room text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  eta_minutes integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_orders TO authenticated;
GRANT ALL ON public.food_orders TO service_role;
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own food orders"
ON public.food_orders FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_food_orders_updated_at
BEFORE UPDATE ON public.food_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.user_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Nyumbani',
  area text NOT NULL DEFAULT '',
  room text NOT NULL DEFAULT '',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_locations TO authenticated;
GRANT ALL ON public.user_locations TO service_role;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own locations"
ON public.user_locations FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reward_points integer NOT NULL DEFAULT 0;