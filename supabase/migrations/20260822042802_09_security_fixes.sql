/*
# Dayflow HRMS — Security fixes

1. Revoke EXECUTE on handle_new_user() from anon and authenticated
   (it's a trigger function, should only run via the trigger)
2. Revoke EXECUTE on is_admin() from anon (authenticated needs it for RLS)
3. Set search_path on set_updated_at() to avoid search_path mutable warning
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;