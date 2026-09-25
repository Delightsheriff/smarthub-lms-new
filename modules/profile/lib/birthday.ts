/**
 * Birthday helpers. Day + month only — no year is ever collected; the
 * field drives the team's reminder list, not an age.
 */

export const BIRTH_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** Mirrors smarthub-api's `DAYS_IN_MONTH` (Feb allows 29 — no year). */
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function daysInBirthMonth(month: number | undefined): number {
  if (!month || month < 1 || month > 12) return 31;
  return DAYS_IN_MONTH[month - 1];
}

/** True when the pair is one the API will accept. */
export function isValidBirthday(day: number, month: number): boolean {
  return (
    Number.isInteger(day) &&
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInBirthMonth(month)
  );
}

/**
 * "17 September". Formatted against an arbitrary leap year so 29 Feb
 * survives and the output reads as a date to mark, not an age.
 * Undefined when either half is missing.
 */
export function formatBirthday(day?: number, month?: number): string | undefined {
  if (!day || !month || !isValidBirthday(day, month)) return undefined;
  return new Date(2000, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
}
