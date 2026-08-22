async function handleCheckIn() {
  if (!profile) return;

  setActionLoading(true);

  try {
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');

    // Prevent duplicate attendance
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', profile.id)
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      setTodayRecord(existing as Attendance);
      return;
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        employee_id: profile.id,
        date: today,
        check_in: now.toISOString(),
        status: 'present',
        work_hours: 0,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Check-in error:', error);
      alert(error.message);
      return;
    }

    if (data) {
      const record = data as Attendance;

      setTodayRecord(record);
      setRecords((prev) => [record, ...prev]);
    }
  } finally {
    setActionLoading(false);
  }
}
