CREATE TABLE public.admin_push_devices (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 token text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_push_devices TO authenticated;
GRANT ALL ON public.admin_push_devices TO service_role;
ALTER TABLE public.admin_push_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_own_push_devices ON public.admin_push_devices FOR ALL TO authenticated USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin')) WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));
CREATE TABLE public.admin_order_push_log (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 event_key text NOT NULL,
 device_id uuid NOT NULL REFERENCES public.admin_push_devices(id) ON DELETE CASCADE,
 status text NOT NULL DEFAULT 'sending',
 error_message text,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(event_key, device_id)
);
GRANT SELECT ON public.admin_order_push_log TO authenticated;
GRANT ALL ON public.admin_order_push_log TO service_role;
ALTER TABLE public.admin_order_push_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY admins_read_push_log ON public.admin_order_push_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));