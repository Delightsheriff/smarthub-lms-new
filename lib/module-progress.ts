/**
 * Duration-weighted module progress — the client mirror of the API's
 * `module-progress.helper`, so the instructor cohort view shows the same
 * percentage a student sees. Durations are free-text and mixed-unit
 * ("3 hours", "2 weeks"); a module that can't be parsed takes the average
 * weight of the ones that can, and if nothing parses we fall back to
 * equal per-module weight (completed / total).
 */

const UNIT_MINUTES: Record<string, number> = {
  month: 43200,
  week: 10080,
  day: 1440,
  hour: 60,
  minute: 1,
};

const DURATION_RE =
  /(\d+(?:\.\d+)?)\s*(months?|mo|weeks?|wks?|w|days?|d|hours?|hrs?|h|minutes?|mins?|m)\b/gi;

const unitToKey = (u: string): keyof typeof UNIT_MINUTES | null => {
  const s = u.toLowerCase();
  if (s.startsWith("mo")) return "month";
  if (s.startsWith("w")) return "week";
  if (s.startsWith("d")) return "day";
  if (s.startsWith("h")) return "hour";
  if (s.startsWith("m")) return "minute";
  return null;
};

export const parseDurationToMinutes = (
  raw?: string | null
): number | null => {
  if (!raw) return null;
  let total = 0;
  let matched = false;
  for (const m of raw.matchAll(DURATION_RE)) {
    const num = m[1];
    const unit = m[2];
    if (num === undefined || unit === undefined) continue;
    const value = Number(num);
    const key = unitToKey(unit);
    if (!key || Number.isNaN(value)) continue;
    total += value * (UNIT_MINUTES[key] ?? 0);
    matched = true;
  }
  return matched ? total : null;
};

export interface ProgressItem {
  completed: boolean;
  duration?: string | null;
}

/** Duration-weighted completion percentage (0–100). */
export const durationWeightedPercent = (items: ProgressItem[]): number => {
  if (items.length === 0) return 0;
  const parsed = items.map((i) => parseDurationToMinutes(i.duration));
  const known = parsed.filter((n): n is number => n !== null);
  const avg =
    known.length > 0 ? known.reduce((a, b) => a + b, 0) / known.length : 1;
  const weightOf = (n: number | null) => (n === null ? avg : n);

  let total = 0;
  let done = 0;
  items.forEach((i, idx) => {
    const w = weightOf(parsed[idx] ?? null);
    total += w;
    if (i.completed) done += w;
  });
  if (total <= 0) {
    const c = items.filter((i) => i.completed).length;
    return Math.round((c / items.length) * 100);
  }
  return Math.round((done / total) * 100);
};
