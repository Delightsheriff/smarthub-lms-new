export interface TeachingCohort {
  id: string;
  startDate: string;
  endDate?: string;
  duration?: string;
  /** Cohort-level delivery mode — falls back to `course.mode` when unset. */
  mode?: string;
  isPrivate?: boolean;
  applicationIsOpen?: boolean;
  applicationEndDate?: string;
  studentCount: number;
  progress: number;
  course: {
    id: string;
    name: string;
    slug?: string;
    mode?: string;
    imageUrl?: string;
    description?: string;
  };
}

export interface TeachingModule {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  learningObjectives?: string[];
  estimatedDuration?: string;
  order?: number;
  assignmentCount?: number;
  recordingCount?: number;
  materialCount?: number;
}

export interface TeachingCohortDetail extends TeachingCohort {
  modules: TeachingModule[];
}

export interface CohortRosterRow {
  studentId: string;
  name: string;
  email?: string;
  lastSubmittedAt: string | null;
  submissionCount: number;
}

export interface CohortAssignmentRow {
  attachmentId: string;
  assignmentId: string;
  title: string;
  description?: string;
  module?: string;
  dueDate?: string;
  allowLateSubmission?: boolean;
  isVisible?: boolean;
  totalPoints?: number;
  submissionCount: number;
  gradedCount: number;
  pendingCount: number;
  lateCount: number;
}

export interface AssignmentScheduleAttachment {
  id: string;
  scheduleId: string;
  courseId?: string;
  courseName?: string;
  startDate?: string;
  duration?: string;
  price?: number;
  isVisible: boolean;
  dueDate?: string;
  allowLateSubmission: boolean;
}

export interface CohortSubmissionRow {
  id: string;
  assignment: { id: string; title: string; totalPoints?: number };
  student: { id: string; name: string; email?: string };
  submittedAt?: string;
  status?: string;
  isLate: boolean;
  score?: number;
  fileUrl?: string;
  externalUrl?: string;
  submissionType?: "file" | "text" | "url";
  fileName?: string;
  fileMimeType?: string;
  content?: string;
  generalFeedback?: string;
}

/** Aggregate row for `GET /lms/teaching/inbox` — a submission across
 *  ANY cohort the caller teaches (not scoped to one cohort, unlike
 *  `CohortSubmissionRow`). `?status=ungraded` (default) drives the
 *  dashboard's Needs-grading strip; `?status=all` drives Recent
 *  submissions. */
export interface InboxRow {
  id: string;
  assignment: { id: string; title: string; totalPoints?: number };
  cohort: { id: string; courseName?: string; startDate?: string };
  student: { id: string; name: string; email?: string };
  submittedAt?: string;
  isLate: boolean;
  /** Present only on the `?status=all` feed, once graded. */
  score?: number;
  status?: string;
  /** Drives the GradingDialog's preview panel — same shape as
   *  CohortSubmissionRow so the two surfaces can share the adapter. */
  submissionType?: "file" | "text" | "url";
  fileUrl?: string;
  fileName?: string;
  fileMimeType?: string;
  externalUrl?: string;
  content?: string;
}

/** One row per (assignment, cohort) attachment across every cohort the
 *  caller teaches, with submission rollups — drives the instructor
 *  Tasks list. */
export interface InstructorAssignmentRow extends CohortAssignmentRow {
  schedule: { id: string; name?: string };
  course: { id: string; name: string; slug?: string };
}

export interface InstructorModuleCohort {
  scheduleId: string;
  scheduleName?: string;
  courseId: string;
  courseName?: string;
  startDate?: string;
}

export interface InstructorModule {
  id: string;
  title: string;
  slug?: string;
  cohorts: InstructorModuleCohort[];
}

export interface InstructorAssignmentRow extends CohortAssignmentRow {
  schedule: { id: string; name?: string };
  course: { id: string; name: string; slug?: string };
}

export interface InboxRow {
  id: string;
  assignment: { id: string; title: string; totalPoints?: number };
  cohort: { id: string; courseName?: string; startDate?: string };
  student: { id: string; name: string; email?: string };
  submittedAt?: string;
  isLate: boolean;
  score?: number;
  status?: string;
  submissionType?: "file" | "text" | "url";
  fileUrl?: string;
  fileName?: string;
  fileMimeType?: string;
  externalUrl?: string;
  content?: string;
}

export interface ModuleAssignmentRow {
  assignmentId: string;
  title: string;
  description?: string;
  totalPoints?: number;
  allowLateSubmission?: boolean;
  isPublished?: boolean;
  attachedScheduleIds: string[];
}

export interface CohortRecordingRow {
  recordingId: string;
  isVisible: boolean;
}

export * from "./attendance";
export * from "./authoring";
export type { ApiTeachingCohort, ApiTeachingCohortDetail } from "./api.types";
