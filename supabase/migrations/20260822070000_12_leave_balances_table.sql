CREATE TABLE IF NOT EXISTS public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE UNIQUE,
  paid_leave_total INT DEFAULT 12,
  paid_leave_used INT DEFAULT 0,
  sick_leave_total INT DEFAULT 8,
  sick_leave_used INT DEFAULT 0,
  casual_leave_total INT DEFAULT 6,
  casual_leave_used INT DEFAULT 0,
  year INT DEFAULT 2026,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own leave balance"
  ON public.leave_balances
  FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE profile_id = auth.uid()
    ) OR public.is_admin()
  );

CREATE POLICY "Admins can update leave balances"
  ON public.leave_balances
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
