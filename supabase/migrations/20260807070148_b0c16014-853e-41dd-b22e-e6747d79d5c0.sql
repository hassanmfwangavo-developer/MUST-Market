-- 1. products ownership tampering
DROP POLICY IF EXISTS "Sellers can update their products" ON public.products;
CREATE POLICY "Sellers can update their products" ON public.products
  FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- 2. profiles self-grant of verified status
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.prevent_verified_self_grant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_verified_student IS DISTINCT FROM OLD.is_verified_student THEN
    NEW.is_verified_student := OLD.is_verified_student;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_no_self_verify ON public.profiles;
CREATE TRIGGER trg_profiles_no_self_verify
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_verified_self_grant();

-- 3. profiles contact details no longer public
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);
REVOKE SELECT ON public.profiles FROM anon;

-- 4. products.whatsapp_number hidden from anonymous visitors (column-level)
REVOKE SELECT ON public.products FROM anon;
GRANT SELECT (
  id, seller_id, category_id, title, description, price_tsh, condition,
  images, location, status, view_count, created_at, updated_at, delivery_timeframe
) ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- 5. storage: no anonymous access + enforce image mime types
DROP POLICY IF EXISTS "Product images are publicly readable" ON storage.objects;
CREATE POLICY "Product images readable by authenticated users" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;
CREATE POLICY "Users can delete their own product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
CREATE POLICY "Users can update their own product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (metadata->>'mimetype') IN ('image/jpeg','image/jpg','image/png','image/webp','image/gif')
  );

DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (metadata->>'mimetype') IN ('image/jpeg','image/jpg','image/png','image/webp','image/gif')
  );