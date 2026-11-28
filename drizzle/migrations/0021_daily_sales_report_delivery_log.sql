CREATE TABLE public.daily_sales_report_deliveries (
 report_key text PRIMARY KEY,
 report_date date NOT NULL,
 cutoff_at timestamptz NOT NULL,
 status text NOT NULL DEFAULT 'sending' CHECK (status IN ('sending','accepted','failed')),
 provider_message_id text,
 created_at timestamptz NOT NULL DEFAULT now(),
 accepted_at timestamptz
);
GRANT ALL ON public.daily_sales_report_deliveries TO service_role;
ALTER TABLE public.daily_sales_report_deliveries ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.daily_sales_report_deliveries IS 'Service-only delivery claims. Ambiguous or failed sends require manual review; do not automatically resend financial reports.';