ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_order_date date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by uuid;
ALTER TABLE public.food_orders ADD COLUMN IF NOT EXISTS reward_points_awarded boolean NOT NULL DEFAULT false;

CREATE TABLE public.referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null,
  invited_id uuid not null unique,
  order_counted boolean not null default false,
  created_at timestamp with time zone not null default now()
);
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (auth.uid() = inviter_id OR auth.uid() = invited_id);

CREATE OR REPLACE FUNCTION public.prevent_rewards_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('postgres', 'service_role') THEN
    NEW.reward_points := OLD.reward_points;
    NEW.current_streak := OLD.current_streak;
    NEW.last_order_date := OLD.last_order_date;
    NEW.referred_by := OLD.referred_by;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_no_self_rewards
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_rewards_self_update();