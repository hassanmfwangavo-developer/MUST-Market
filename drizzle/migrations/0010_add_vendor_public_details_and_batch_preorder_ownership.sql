ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS operating_hours text,
  ADD COLUMN IF NOT EXISTS support_phone text,
  ADD COLUMN IF NOT EXISTS dropoff_zones text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.batch_preorders
  ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_batch_preorders_vendor_id
  ON public.batch_preorders(vendor_id);

CREATE OR REPLACE FUNCTION public.set_batch_preorder_vendor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  first_meal text;
  resolved uuid;
BEGIN
  IF NEW.vendor_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT elem->>'mealId' INTO first_meal
  FROM jsonb_array_elements(COALESCE(NEW.items, '[]'::jsonb)) AS elem
  WHERE (elem->>'mealId') ~ '^[0-9a-fA-F-]{36}$'
  LIMIT 1;

  IF first_meal IS NOT NULL THEN
    SELECT m.vendor_id INTO resolved
    FROM public.menu_items m
    WHERE m.id = first_meal::uuid;
    NEW.vendor_id := resolved;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_batch_preorder_vendor ON public.batch_preorders;
CREATE TRIGGER trg_set_batch_preorder_vendor
  BEFORE INSERT ON public.batch_preorders
  FOR EACH ROW EXECUTE FUNCTION public.set_batch_preorder_vendor();

CREATE POLICY "Vendors view their restaurant batch pre-orders"
  ON public.batch_preorders FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'vendor')
    AND vendor_id IS NOT NULL
    AND vendor_id = public.vendor_id_for(auth.uid())
  );