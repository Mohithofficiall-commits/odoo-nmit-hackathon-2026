
CREATE TABLE IF NOT EXISTS public.attendance (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date        date NOT NULL,
  check_in    timestamptz,
  check_out   timestamptz,
  status      text NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','half_day','leave','weekend')),
  work_hours  numeric(5,2) DEFAULT 0,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, date)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attendance_select" ON public.attendance;
CREATE POLICY "attendance_select" ON public.attendance
  FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "attendance_insert_own" ON public.attendance;
CREATE POLICY "attendance_insert_own" ON public.attendance
  FOR INSERT TO authenticated
  WITH CHECK (employee_id = auth.uid());

DROP POLICY IF EXISTS "attendance_insert_admin" ON public.attendance;
CREATE POLICY "attendance_insert_admin" ON public.attendance
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "attendance_update" ON public.attendance;
CREATE POLICY "attendance_update" ON public.attendance
  FOR UPDATE TO authenticated
  USING (employee_id = auth.uid() OR public.is_admin())
  WITH CHECK (employee_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "attendance_delete_admin" ON public.attendance;
CREATE POLICY "attendance_delete_admin" ON public.attendance
  FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON public.attendance(employee_id, date);

DROP TRIGGER IF EXISTS trg_attendance_updated ON public.attendance;
CREATE TRIGGER trg_attendance_updated BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
