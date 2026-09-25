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

/** Shift a datetime-local value by whole days; falls back to now. */
export function addDaysToLocalInput(value: string, days: number): string {
  const base = value ? new Date(value) : new Date();
  const start = Number.isNaN(base.getTime()) ? new Date() : base;
  return dateToLocalInput(new Date(start.getTime() + days * 24 * 60 * 60 * 1000));
}
