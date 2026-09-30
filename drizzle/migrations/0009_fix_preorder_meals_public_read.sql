DROP POLICY IF EXISTS "Anyone reads active preorder meals" ON public.preorder_meals;
CREATE POLICY "Public reads active preorder meals" ON public.preorder_meals FOR SELECT TO anon USING (is_active);
CREATE POLICY "Signed-in read preorder meals" ON public.preorder_meals FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(), 'admin'::app_role));