export interface SubmissionWindowCheckParams {
  dueAt: string | Date;
  allowLateSubmission?: boolean;
  submission?: {
    status?: string;
    grade?: { percentage?: number; score?: number };
  } | null;
  now?: number;
}

/**
 * Pure predicate computing whether the submission window is closed.
 *
 * Rules:
 * - Before deadline: window is always open.
 * - After deadline:
 *   - If late submissions are allowed: window is open.
 *   - If returned for revision: window is open (instructor requested updates).
 *   - If graded with score < 70%: window is open (resubmission fix-it path).
 *   - Otherwise: window is closed.
 */
export function isSubmissionWindowClosed({
  dueAt,
  allowLateSubmission = false,
  submission = null,
  now = Date.now(),
}: SubmissionWindowCheckParams): boolean {
  const due = typeof dueAt === "string" ? new Date(dueAt).getTime() : dueAt.getTime();
  const pastDue = due < now;

  if (!pastDue) return false;
  if (allowLateSubmission) return false;
  if (submission?.status === "returned") return false;

  const pct = submission?.grade?.percentage;
  if (submission?.status === "graded" && typeof pct === "number" && pct < 70) {
    return false;
  }

  return true;
}

/**
 * Pure predicate computing whether an existing submission can be resubmitted.
 */
export function canResubmitSubmission(params: SubmissionWindowCheckParams): boolean {
  if (!params.submission) return false;
  return !isSubmissionWindowClosed(params);
}
