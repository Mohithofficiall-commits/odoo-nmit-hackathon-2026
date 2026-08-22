CREATE TABLE IF NOT EXISTS public.payroll (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  base_salary         numeric(12,2) NOT NULL DEFAULT 0,
  hra                 numeric(12,2) NOT NULL DEFAULT 0,
  da                  numeric(12,2) NOT NULL DEFAULT 0,
  transport_allowance numeric(12,2) NOT NULL DEFAULT 0,
  medical_allowance   numeric(12,2) NOT NULL DEFAULT 0,
  tax_deduction       numeric(12,2) NOT NULL DEFAULT 0,
  provident_fund      numeric(12,2) NOT NULL DEFAULT 0,
  net_salary          numeric(12,2) GENERATED ALWAYS AS (
    base_salary + hra + da + transport_allowance + medical_allowance
    - tax_deduction - provident_fund
  ) STORED,
  payroll_month       text NOT NULL DEFAULT to_char(now(), 'YYYY-MM'),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, payroll_month)
);
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payroll_select" ON public.payroll;
CREATE POLICY "payroll_select" ON public.payroll
  FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "payroll_insert_admin" ON public.payroll;
CREATE POLICY "payroll_insert_admin" ON public.payroll
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "payroll_update_admin" ON public.payroll;
CREATE POLICY "payroll_update_admin" ON public.payroll
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_payroll_employee ON public.payroll(employee_id);

DROP TRIGGER IF EXISTS trg_payroll_updated ON public.payroll;
CREATE TRIGGER trg_payroll_updated BEFORE UPDATE ON public.payroll
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
