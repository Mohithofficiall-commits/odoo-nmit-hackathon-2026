BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE
    public.leave_requests,
    public.announcements,
    public.attendance;
COMMIT;
