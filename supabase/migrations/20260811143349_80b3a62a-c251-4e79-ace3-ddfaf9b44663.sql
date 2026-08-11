DROP POLICY IF EXISTS "Active products viewable by everyone" ON public.products;

CREATE POLICY "Active and sold products viewable by everyone"
ON public.products
FOR SELECT
USING (status IN ('active'::product_status, 'sold'::product_status) OR auth.uid() = seller_id);