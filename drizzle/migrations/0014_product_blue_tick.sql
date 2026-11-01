ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.prevent_product_verified_self_grant()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.is_verified := false;
    ELSIF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
      NEW.is_verified := OLD.is_verified;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS products_verified_guard ON public.products;
CREATE TRIGGER products_verified_guard BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.prevent_product_verified_self_grant();