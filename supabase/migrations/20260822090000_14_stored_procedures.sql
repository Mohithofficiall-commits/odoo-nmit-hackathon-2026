CREATE OR REPLACE FUNCTION get_attendance_summary(start_date DATE, end_date DATE)
RETURNS TABLE (
  total_present BIGINT,
  total_absent BIGINT,
  total_leave BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'present') AS total_present,
    COUNT(*) FILTER (WHERE status = 'absent') AS total_absent,
    COUNT(*) FILTER (WHERE status = 'leave') AS total_leave
  FROM public.attendance
  WHERE date BETWEEN start_date AND end_date;
END;
$$;
