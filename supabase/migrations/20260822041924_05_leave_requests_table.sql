/*
# Dayflow HRMS — Leave requests table

Leave applications and approvals.
Types: paid, sick, unpaid. Status: pending, approved, rejected.

## Security
- RLS enabled.
- Employees SELECT/INSERT own; admins SELECT all and UPDATE any.
*/

CREATE TABLE IF NOT EXISTS public.leave_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type    text NOT NULL CHECK (leave_type IN ('paid','sick','unpaid')),
  start_date    date NOT NULL,
  end_date      date NOT NULL,
  remarks       text,
  admin_comment text,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leaves_select" ON public.leave_requests;
CREATE POLICY "leaves_select" ON public.leave_requests
  FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "leaves_insert_own" ON public.leave_requests;
CREATE POLICY "leaves_insert_own" ON public.leave_requests
  FOR INSERT TO authenticated
  WITH CHECK (employee_id = auth.uid());

DROP POLICY IF EXISTS "leaves_update" ON public.leave_requests;
CREATE POLICY "leaves_update" ON public.leave_requests
  FOR UPDATE TO authenticated
  USING (employee_id = auth.uid() OR public.is_admin())
  WITH CHECK (employee_id = auth.uid() OR public.is_admin());

CREATE INDEX IF NOT EXISTS idx_leaves_employee ON public.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON public.leave_requests(status);

DROP TRIGGER IF EXISTS trg_leaves_updated ON public.leave_requests;
CREATE TRIGGER trg_leaves_updated BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();