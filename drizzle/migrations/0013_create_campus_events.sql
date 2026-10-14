CREATE TABLE public.campus_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'event' CHECK (kind IN ('event','news')),
  category text NOT NULL DEFAULT 'notices' CHECK (category IN ('notices','academic','sports','guild','entertainment')),
  event_date timestamptz,
  venue text,
  image_url text,
  organizer_name text NOT NULL DEFAULT '',
  contact_phone text,
  submitted_by uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campus_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_events TO authenticated;
GRANT ALL ON public.campus_events TO service_role;
ALTER TABLE public.campus_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads approved events" ON public.campus_events FOR SELECT USING (status = 'approved');
CREATE POLICY "Owners read own submissions" ON public.campus_events FOR SELECT TO authenticated USING (submitted_by = auth.uid());
CREATE POLICY "Admins read all events" ON public.campus_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Students submit pending events" ON public.campus_events FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid() AND status = 'pending' AND is_pinned = false);
CREATE POLICY "Admins insert events" ON public.campus_events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update events" ON public.campus_events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete events" ON public.campus_events FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX campus_events_status_date_idx ON public.campus_events (status, event_date);