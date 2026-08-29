import type {
  ApiInternship,
  ApiInternshipCheckIn,
  ApiInternshipTask,
} from "../types/api.types";
import type { InternshipWorkspaceUi } from "../types";

/** Weight per task status when deriving progress from the task list.
 *  A submitted task is worth more than one merely in progress, and a
 *  done task closes the loop. */
export const TASK_STATUS_WEIGHT = {
  todo: 0,
  in_progress: 0.4,
  submitted: 0.7,
  done: 1,
} as const;

/**
 * Derive a 0–100 progress percent from the task list. This is the
 * tested seam for Plan 010: the server is the source of truth for
 * `progressPercent`, but this mirrors how the backend computes it so
 * the workspace can (a) sanity a missing server value and (b) stay
 * honest in tests.
 */
export function computeProgress(tasks: ApiInternshipTask[]): number {
  if (!tasks || tasks.length === 0) return 0;
  const total = tasks.reduce(
    (sum, t) => sum + TASK_STATUS_WEIGHT[t.status],
    0,
  );
  return Math.round((total / tasks.length) * 100);
}

const byNewest = (a: ApiInternshipCheckIn, b: ApiInternshipCheckIn) =>
  new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime();

export function normaliseWorkspace(
  internship: ApiInternship | null,
): InternshipWorkspaceUi | null {
  if (!internship) return null;
  const tasks = [...(internship.tasks ?? [])].sort(
    (a, b) => a.order - b.order,
  );
  return {
    internship,
    tasks,
    checkIns: [...(internship.checkIns ?? [])].sort(byNewest),
    // The server is the source of truth for progress; derive from the
    // task list only if it ever arrives absent (defensive).
    progressPercent: internship.progressPercent ?? computeProgress(tasks),
  };
}