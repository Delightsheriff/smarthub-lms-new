export interface MonthDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function getMonthDays(year: number, month: number): MonthDay[] {
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();

  const days: MonthDay[] = [];

  // Overhang days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
    });
  }

  // Days in current month
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    days.push({
      date: d,
      isCurrentMonth: true,
      isToday: isSameDay(d, today),
    });
  }

  // Overhang days for next month to complete 42 cells (6 rows × 7 days)
  const remainingCells = 42 - days.length;
  for (let day = 1; day <= remainingCells; day++) {
    const d = new Date(year, month + 1, day);
    days.push({
      date: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
    });
  }

  return days;
}

export function getWeekDays(currentDate: Date): Array<{ date: Date; isToday: boolean }> {
  const today = new Date();
  const dayOfWeek = currentDate.getDay(); // 0 = Sunday
  const sunday = new Date(currentDate);
  sunday.setDate(currentDate.getDate() - dayOfWeek);

  const days: Array<{ date: Date; isToday: boolean }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    days.push({
      date: d,
      isToday: isSameDay(d, today),
    });
  }
  return days;
}

export function formatHourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

export function calculateEventPosition(
  start: Date,
  end?: Date,
  dayStartHour = 8,
  totalHours = 12,
): { topPercent: number; heightPercent: number } {
  const startMins = start.getHours() * 60 + start.getMinutes();
  const dayStartMins = dayStartHour * 60;
  const dayTotalMins = totalHours * 60;

  const clampedStart = Math.max(0, startMins - dayStartMins);
  const topPercent = Math.min(100, (clampedStart / dayTotalMins) * 100);

  const durationMins = end
    ? Math.max(30, (end.getTime() - start.getTime()) / 60_000)
    : 60;

  const heightPercent = Math.min(100 - topPercent, (durationMins / dayTotalMins) * 100);

  return {
    topPercent: Math.max(0, topPercent),
    heightPercent: Math.max(5, heightPercent),
  };
}
