import type { CohortRosterRow } from "../types";

export type RosterFilter = "all" | "no-activity" | "quiet";

export const ROSTER_FILTERS: { value: RosterFilter; label: string }[] = [
  { value: "all", label: "All students" },
  { value: "no-activity", label: "Nothing submitted yet" },
  { value: "quiet", label: "Quiet for 14+ days" },
];

const QUIET_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * At-risk views from what the roster already carries (submission count
 * and last hand-in). "Quiet" includes students who never submitted.
 */
export function filterRoster(
  rows: CohortRosterRow[],
  filter: RosterFilter,
  now: number = Date.now(),
): CohortRosterRow[] {
  if (filter === "no-activity") return rows.filter((r) => r.submissionCount === 0);
  if (filter === "quiet") {
    return rows.filter(
      (r) => !r.lastSubmittedAt || now - new Date(r.lastSubmittedAt).getTime() >= QUIET_MS,
    );
  }
  return rows;
}
