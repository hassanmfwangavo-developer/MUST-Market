CREATE TABLE IF NOT EXISTS public.campus_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  provider_name TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  starting_price NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  operating_hours TEXT,
  phone_number TEXT NOT NULL DEFAULT '',
  whatsapp_number TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  image_path TEXT,
  portfolio_images TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC NOT NULL DEFAULT 5.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.campus_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_services TO authenticated;
GRANT ALL ON public.campus_services TO service_role;

ALTER TABLE public.campus_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests can view active campus services"
  ON public.campus_services FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Members can view campus services"
  ON public.campus_services FOR SELECT TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage campus services"
  ON public.campus_services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.campus_services
  (title, category, provider_name, location, starting_price, description, operating_hours, phone_number, whatsapp_number, image_url, portfolio_images, rating, review_count)
VALUES
  ('Fundi Sam Tech', 'Phone & Electronics', 'Samson Mwakyusa', 'Block B / Iyunga Gate', 5000,
   'Fast, careful phone and laptop repairs for MUST students, with a clear diagnosis before any work begins. Screen replacement, charging ports, batteries and Windows installation.',
   'Mon-Sat 8:00 AM - 8:00 PM', '255674044676', '255674044676',
   '/__l5e/assets-v1/cb5876c5-1b96-4d32-b74c-4e7b99cb57eb/service-phone-repair.jpg',
   ARRAY['/__l5e/assets-v1/cb5876c5-1b96-4d32-b74c-4e7b99cb57eb/service-phone-repair.jpg','/__l5e/assets-v1/06ded776-29f0-45a5-9679-6eca594b0a55/service-printing.jpg'],
   4.9, 24),
  ('FreshFold Campus Laundry', 'Laundry & Pasi', 'Neema Laundry Team', 'Iyunga / Hostel pickup', 8000,
   'Reliable wash, dry and ironing with convenient pickup around campus and nearby student ghettos. Bedding and duvet bundles available.',
   'Daily 7:30 AM - 7:00 PM', '255674044676', '255674044676',
   '/__l5e/assets-v1/595a0e84-b1d1-4889-b070-7e89f2a8e8ca/service-laundry.jpg',
   ARRAY['/__l5e/assets-v1/595a0e84-b1d1-4889-b070-7e89f2a8e8ca/service-laundry.jpg'],
   4.8, 31),
  ('Sparkle Gheto Cleaning', 'Usafi wa Gheto', 'Sparkle Crew', 'Coca / Inyara / Iyunga', 10000,
   'Student-friendly room cleaning for move-ins, busy weeks and fresh starts, with cleaning supplies included.',
   'Mon-Sun 8:00 AM - 6:00 PM', '255674044676', '255674044676',
   '/__l5e/assets-v1/595a0e84-b1d1-4889-b070-7e89f2a8e8ca/service-laundry.jpg',
   ARRAY['/__l5e/assets-v1/595a0e84-b1d1-4889-b070-7e89f2a8e8ca/service-laundry.jpg'],
   4.7, 18),
  ('MUST Print Hub', 'Printing & Stationery', 'Print Hub Team', 'Main Gate / Academic Blocks', 100,
   'Quick academic printing, binding and stationery for assignments, reports and final-year projects. Colour printing, photocopy and spiral binding.',
   'Mon-Sat 7:00 AM - 9:00 PM', '255674044676', '255674044676',
   '/__l5e/assets-v1/06ded776-29f0-45a5-9679-6eca594b0a55/service-printing.jpg',
   ARRAY['/__l5e/assets-v1/06ded776-29f0-45a5-9679-6eca594b0a55/service-printing.jpg'],
   4.9, 46),
  ('Sharp Cut Campus Salon', 'Beauty & Salon', 'Sharp Cut Barbers', 'Iyunga Gate', 3000,
   'Clean cuts and student-ready grooming in a relaxed studio a few minutes from the MUST gate. Home service available.',
   'Daily 9:00 AM - 9:00 PM', '255674044676', '255674044676',
   '/__l5e/assets-v1/e47d9de7-2946-4377-b6bf-3d627f6ba383/service-beauty.jpg',
   ARRAY['/__l5e/assets-v1/e47d9de7-2946-4377-b6bf-3d627f6ba383/service-beauty.jpg'],
   4.8, 37);