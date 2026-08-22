/*
# Dayflow HRMS — Profiles table

Extends auth.users with app-level data: full_name, email, role, employee_id,
avatar_url, phone, address. 1:1 with auth.users.

## Security
- RLS enabled.
- All authenticated users can SELECT (needed for directory).
- Users can UPDATE their own profile; admins can update any.
- Only admins can INSERT.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text NOT NULL,
  email       text NOT NULL,
  role        text NOT NULL DEFAULT 'employee' CHECK (role IN ('admin','employee')),
  employee_id text UNIQUE,
  avatar_url  text,
  phone       text,
  address     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
CREATE POLICY "profiles_admin_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();