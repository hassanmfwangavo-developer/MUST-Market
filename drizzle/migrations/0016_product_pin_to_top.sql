ALTER TABLE public.products ADD COLUMN pinned_at timestamptz;
GRANT SELECT (pinned_at) ON public.products TO anon, authenticated;
CREATE OR REPLACE FUNCTION public.prevent_product_pin_self_grant()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN NEW.pinned_at := NULL; END IF;
  ELSIF NEW.pinned_at IS DISTINCT FROM OLD.pinned_at AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.pinned_at := OLD.pinned_at;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER products_pin_guard BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.prevent_product_pin_self_grant();