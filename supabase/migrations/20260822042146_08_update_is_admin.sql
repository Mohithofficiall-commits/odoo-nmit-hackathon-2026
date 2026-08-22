/*
# Dayflow HRMS — Update is_admin to check profiles table

The previous is_admin() read from JWT app_metadata, but the client
cannot set app_metadata during signUp. Updated to check the profiles
table directly for the user's role.
*/

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin',
    false
  );
$$;