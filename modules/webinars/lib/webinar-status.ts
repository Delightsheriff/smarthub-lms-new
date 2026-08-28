/**
 * Derive the live status of a webinar from its scheduled start date.
 *
 *   now < start                 → "upcoming"
 *   start ≤ now < start + 2h    → "ongoing"
 *   start + 2h ≤ now            → "passed"
 *
 * The 2-hour window is a project-wide constant.
 *
 * Falls back to `"upcoming"` for missing / unparseable dates.
 */
export type WebinarStatus = "upcoming" | "ongoing" | "passed";

export const WEBINAR_DURATION_MS = 2 * 60 * 60 * 1000;

export const webinarStatus = (
  date: string | Date | undefined | null,
): WebinarStatus => {
  if (!date) return "upcoming";
  const start = typeof date === "string" ? new Date(date) : date;
  const t = start.getTime();
  if (Number.isNaN(t)) return "upcoming";
  const now = Date.now();
  if (now < t) return "upcoming";
  if (now < t + WEBINAR_DURATION_MS) return "ongoing";
  return "passed";
};

export const webinarStatusLabel: Record<WebinarStatus, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  passed: "Passed",
};

// Join link is only "live" from 10 minutes before the webinar starts
// until 2 hours after it starts.
export function isJoinWindowOpen(dateStr?: string | null) {
  if (!dateStr) return false;
  const start = new Date(dateStr).getTime();
  const now = Date.now();
  const opensAt = start - 10 * 60 * 1000; // 10 min before
  const closesAt = start + 2 * 60 * 60 * 1000; // 2 hrs after
  return now >= opensAt && now <= closesAt;
}
