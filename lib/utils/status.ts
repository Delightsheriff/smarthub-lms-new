export type StatusTone = "success" | "warning" | "destructive" | "accent" | "neutral";

/**
 * Canonical status -> {label, tone} used by `StatusBadge`. Keys are matched
 * case-insensitively. `tone` maps 1:1 to a `Badge` variant (success/warning/
 * destructive/accent/outline) — add to this registry rather than inventing a
 * one-off color combination at the call site.
 */
export const STATUS_REGISTRY: Record<string, { label: string; tone: StatusTone }> = {
  active: { label: "Active", tone: "success" },
  live: { label: "Live", tone: "success" },
  paid: { label: "Paid", tone: "success" },
  graded: { label: "Graded", tone: "success" },
  approved: { label: "Approved", tone: "success" },
  completed: { label: "Completed", tone: "success" },
  earned: { label: "Earned", tone: "success" },
  waived: { label: "Waived", tone: "success" },
  done: { label: "Done", tone: "success" },

  pending: { label: "Pending", tone: "warning" },
  processing: { label: "Processing", tone: "warning" },
  "in progress": { label: "In progress", tone: "warning" },
  in_progress: { label: "In progress", tone: "warning" },
  late: { label: "Late", tone: "warning" },
  "needs grading": { label: "Needs grading", tone: "warning" },
  upcoming: { label: "Upcoming", tone: "warning" },
  submitted: { label: "Submitted", tone: "warning" },

  failed: { label: "Failed", tone: "destructive" },
  cancelled: { label: "Cancelled", tone: "destructive" },
  canceled: { label: "Cancelled", tone: "destructive" },
  rejected: { label: "Rejected", tone: "destructive" },
  overdue: { label: "Overdue", tone: "destructive" },
  defaulted: { label: "Defaulted", tone: "destructive" },
  terminated: { label: "Terminated", tone: "destructive" },

  draft: { label: "Draft", tone: "neutral" },
  ended: { label: "Ended", tone: "neutral" },
  remote: { label: "Remote", tone: "neutral" },
  onsite: { label: "Onsite", tone: "neutral" },
  archived: { label: "Archived", tone: "neutral" },
  todo: { label: "To do", tone: "neutral" },
  refunded: { label: "Refunded", tone: "neutral" },
  // A milestone, not a routine state — the brand accent sets it apart.
  qualified: { label: "Qualified", tone: "accent" },
  "not-started": { label: "Not started", tone: "neutral" },
  "not started": { label: "Not started", tone: "neutral" },
  present: { label: "Present", tone: "success" },
  absent: { label: "Absent", tone: "destructive" },
  excused: { label: "Excused", tone: "neutral" },
  unmarked: { label: "Unmarked", tone: "neutral" },
};

export function resolveStatus(status: string): { label: string; tone: StatusTone } {
  return STATUS_REGISTRY[status.toLowerCase()] ?? { label: status, tone: "neutral" };
}
