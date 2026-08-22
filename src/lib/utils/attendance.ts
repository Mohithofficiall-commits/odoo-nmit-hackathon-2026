export function calculateWorkHours(checkInIso: string, checkOutIso: string): number {
  const checkIn = new Date(checkInIso);
  const checkOut = new Date(checkOutIso);
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  return Math.max(0, Math.round(hours * 100) / 100);
}

export function calculateOvertime(workHours: number, standardHours: number = 8): number {
  if (workHours <= standardHours) return 0;
  return Math.round((workHours - standardHours) * 100) / 100;
}

export function isLateCheckIn(checkInIso: string, expectedTimeStr: string = '09:30'): boolean {
  const checkIn = new Date(checkInIso);
  const [hours, minutes] = expectedTimeStr.split(':').map(Number);
  const expectedDate = new Date(checkIn);
  expectedDate.setHours(hours, minutes, 0, 0);

  return checkIn > expectedDate;
}
