const pad = (n: number) => String(n).padStart(2, "0");

/** Date → `<input type="datetime-local">` value, in the viewer's local time. */
export function dateToLocalInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** ISO string → datetime-local value; "" when missing or unparseable. */
export function isoToLocalInput(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dateToLocalInput(d);
}

/**
 * Extend a due date by whole days. Starts from the later of the current
 * value and `now` — extending an already-past date would still be in the
 * past, and the API rejects due dates that aren't in the future.
 */
export function addDaysToLocalInput(
  value: string,
  days: number,
  now: Date = new Date(),
): string {
  const parsed = value ? new Date(value) : now;
  const base =
    Number.isNaN(parsed.getTime()) || parsed < now ? now : parsed;
  return dateToLocalInput(new Date(base.getTime() + days * 24 * 60 * 60 * 1000));
}

/** True when a datetime-local value is strictly in the future. */
export function isFutureLocalInput(value: string, now: Date = new Date()): boolean {
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d > now;
}
