ALTER TABLE public.food_orders
  ADD COLUMN batch_slot text,
  ADD COLUMN hostel_zone text,
  ADD COLUMN drop_point text;

ALTER TABLE public.food_orders
  ADD CONSTRAINT food_orders_batch_slot_values
  CHECK (batch_slot IS NULL OR batch_slot IN ('lunch', 'dinner')) NOT VALID;

ALTER TABLE public.food_orders
  ADD CONSTRAINT food_orders_hostel_zone_values
  CHECK (hostel_zone IS NULL OR hostel_zone IN ('boys_6', 'girls_8', 'new_hostels')) NOT VALID;

COMMENT ON COLUMN public.food_orders.batch_slot IS 'Selected shared delivery batch: lunch or dinner.';
COMMENT ON COLUMN public.food_orders.hostel_zone IS 'Selected MUST hostel batch drop-off zone.';
COMMENT ON COLUMN public.food_orders.drop_point IS 'Human-readable shared hostel drop point captured at checkout.';