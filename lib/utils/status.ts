export type StatusTone = "success" | "warning" | "destructive" | "neutral";

/**
 * Canonical status -> {label, tone} used by `StatusBadge`. Keys are matched
 * case-insensitively. `tone` maps 1:1 to a `Badge` variant (success/warning/
 * destructive/outline) — add to this registry rather than inventing a
 * one-off color combination at the call site.
 */
export const STATUS_REGISTRY: Record<string, { label: string; tone: StatusTone }> = {
  active: { label: "Active", tone: "success" },
  live: { label: "Live", tone: "success" },
  paid: { label: "Paid", tone: "success" },
  graded: { label: "Graded", tone: "success" },
  approved: { label: "Approved", tone: "success" },
  completed: { label: "Completed", tone: "success" },

  pending: { label: "Pending", tone: "warning" },
  processing: { label: "Processing", tone: "warning" },
  "in progress": { label: "In progress", tone: "warning" },
  late: { label: "Late", tone: "warning" },
  "needs grading": { label: "Needs grading", tone: "warning" },
  upcoming: { label: "Upcoming", tone: "warning" },

  failed: { label: "Failed", tone: "destructive" },
  cancelled: { label: "Cancelled", tone: "destructive" },
  rejected: { label: "Rejected", tone: "destructive" },
  overdue: { label: "Overdue", tone: "destructive" },

  draft: { label: "Draft", tone: "neutral" },
  ended: { label: "Ended", tone: "neutral" },
  remote: { label: "Remote", tone: "neutral" },
  onsite: { label: "Onsite", tone: "neutral" },
  archived: { label: "Archived", tone: "neutral" },
};

export function resolveStatus(status: string): { label: string; tone: StatusTone } {
  return STATUS_REGISTRY[status.toLowerCase()] ?? { label: status, tone: "neutral" };
}
