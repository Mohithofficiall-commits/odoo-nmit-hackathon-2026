CREATE TABLE IF NOT EXISTS public.employees (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id     text UNIQUE NOT NULL,
  department      text,
  designation     text,
  employment_type text DEFAULT 'Full-time',
  join_date       date,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  manager         text,
  work_location   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employees_select_all" ON public.employees;
CREATE POLICY "employees_select_all" ON public.employees
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "employees_admin_insert" ON public.employees;
CREATE POLICY "employees_admin_insert" ON public.employees
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "employees_admin_update" ON public.employees;
CREATE POLICY "employees_admin_update" ON public.employees
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "employees_admin_delete" ON public.employees;
CREATE POLICY "employees_admin_delete" ON public.employees
  FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);

DROP TRIGGER IF EXISTS trg_employees_updated ON public.employees;
CREATE TRIGGER trg_employees_updated BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
