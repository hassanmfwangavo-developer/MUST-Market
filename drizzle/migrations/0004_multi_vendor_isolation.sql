-- 1. Restaurant (vendor) staff assignment: admin-managed, never self-editable
CREATE TABLE IF NOT EXISTS public.vendor_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_members TO authenticated;
GRANT ALL ON public.vendor_members TO service_role;

ALTER TABLE public.vendor_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own vendor assignment"
  ON public.vendor_members FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read vendor assignments"
  ON public.vendor_members FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert vendor assignments"
  ON public.vendor_members FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update vendor assignments"
  ON public.vendor_members FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete vendor assignments"
  ON public.vendor_members FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Helper: which restaurant does this user operate?
CREATE OR REPLACE FUNCTION public.vendor_id_for(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT vendor_id FROM public.vendor_members WHERE user_id = _user_id LIMIT 1;
$$;

-- 3. Attribute food orders and pre-orders to a restaurant
ALTER TABLE public.food_orders ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL;
ALTER TABLE public.msosi_pre_orders ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL;
ALTER TABLE public.msosi_pre_orders ADD COLUMN IF NOT EXISTS scheduled_for text;

CREATE OR REPLACE FUNCTION public.set_food_order_vendor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  first_item text;
  resolved uuid;
BEGIN
  IF NEW.vendor_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  SELECT (elem->>'itemId') INTO first_item
  FROM jsonb_array_elements(COALESCE(NEW.items, '[]'::jsonb)) AS elem
  WHERE (elem->>'itemId') ~ '^[0-9a-fA-F-]{36}$'
  LIMIT 1;
  IF first_item IS NOT NULL THEN
    SELECT m.vendor_id INTO resolved FROM public.menu_items m WHERE m.id = first_item::uuid;
    NEW.vendor_id := resolved;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_food_order_vendor ON public.food_orders;
CREATE TRIGGER trg_set_food_order_vendor
  BEFORE INSERT ON public.food_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_food_order_vendor();

CREATE OR REPLACE FUNCTION public.set_pre_order_vendor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.vendor_id IS NULL AND NEW.item_id IS NOT NULL THEN
    SELECT m.vendor_id INTO NEW.vendor_id FROM public.menu_items m WHERE m.id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_pre_order_vendor ON public.msosi_pre_orders;
CREATE TRIGGER trg_set_pre_order_vendor
  BEFORE INSERT ON public.msosi_pre_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_pre_order_vendor();

-- Backfill existing rows
UPDATE public.msosi_pre_orders p
SET vendor_id = m.vendor_id
FROM public.menu_items m
WHERE p.vendor_id IS NULL AND p.item_id = m.id;

UPDATE public.food_orders o
SET vendor_id = sub.vendor_id
FROM (
  SELECT o2.id AS order_id, m.vendor_id
  FROM public.food_orders o2
  CROSS JOIN LATERAL (
    SELECT (elem->>'itemId') AS item_id
    FROM jsonb_array_elements(COALESCE(o2.items, '[]'::jsonb)) AS elem
    WHERE (elem->>'itemId') ~ '^[0-9a-fA-F-]{36}$'
    LIMIT 1
  ) f
  JOIN public.menu_items m ON m.id = f.item_id::uuid
) sub
WHERE o.id = sub.order_id AND o.vendor_id IS NULL;

-- 4. Vendor-scoped RLS
CREATE POLICY "Vendors view their restaurant orders"
  ON public.food_orders FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'vendor')
    AND vendor_id IS NOT NULL
    AND vendor_id = public.vendor_id_for(auth.uid())
  );

CREATE POLICY "Vendors update their restaurant orders"
  ON public.food_orders FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'vendor')
    AND vendor_id IS NOT NULL
    AND vendor_id = public.vendor_id_for(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'vendor')
    AND vendor_id = public.vendor_id_for(auth.uid())
  );

CREATE POLICY "Vendors view their restaurant pre-orders"
  ON public.msosi_pre_orders FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'vendor')
    AND vendor_id IS NOT NULL
    AND vendor_id = public.vendor_id_for(auth.uid())
  );

CREATE POLICY "Vendors update their restaurant pre-orders"
  ON public.msosi_pre_orders FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'vendor')
    AND vendor_id IS NOT NULL
    AND vendor_id = public.vendor_id_for(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'vendor')
    AND vendor_id = public.vendor_id_for(auth.uid())
  );

CREATE POLICY "Vendors update their own menu items"
  ON public.menu_items FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'vendor')
    AND vendor_id IS NOT NULL
    AND vendor_id = public.vendor_id_for(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'vendor')
    AND vendor_id = public.vendor_id_for(auth.uid())
  );

-- 5. Live order feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.food_orders;