CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON public.attendance (employee_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_status ON public.leave_requests (employee_id, status);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees (department);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON public.employees (employee_id);
