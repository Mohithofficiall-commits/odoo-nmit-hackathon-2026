CREATE OR REPLACE FUNCTION auto_deduct_leave_balance()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'Approved' AND OLD.status != 'Approved' THEN
    IF NEW.leave_type = 'Paid' THEN
      UPDATE public.leave_balances
      SET paid_leave_used = paid_leave_used + 1, updated_at = now()
      WHERE employee_id = NEW.employee_id;
    ELSIF NEW.leave_type = 'Sick' THEN
      UPDATE public.leave_balances
      SET sick_leave_used = sick_leave_used + 1, updated_at = now()
      WHERE employee_id = NEW.employee_id;
    ELSIF NEW.leave_type = 'Casual' THEN
      UPDATE public.leave_balances
      SET casual_leave_used = casual_leave_used + 1, updated_at = now()
      WHERE employee_id = NEW.employee_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_deduct_leave ON public.leave_requests;

CREATE TRIGGER trg_auto_deduct_leave
  AFTER UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION auto_deduct_leave_balance();
