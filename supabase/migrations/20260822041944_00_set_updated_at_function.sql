/*
# Dayflow HRMS — updated_at trigger function

Creates a reusable trigger function that sets updated_at = now() on row update.
Used by all table triggers.
*/

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;