export type AttendanceStatus = "present" | "late" | "absent" | "excused";

export type AttendanceSource =
  | "meet-report"
  | "qr-scan"
  | "terminal-pin"
  | "instructor"
  | "admin";

export interface SessionAttendanceMeta {
  _id: string;
  scheduleId: string;
  startsAt: string;
  durationMinutes: number;
  title: string;
  location?: string;
  link?: string;
  isCancelled?: boolean;
}

export interface SessionAttendanceRow {
  studentId: string;
  enrollmentId: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  status?: AttendanceStatus;
  source?: AttendanceSource;
  durationMinutes?: number;
  note?: string;
  markedAt?: string;
}

export interface SessionAttendanceResponse {
  session: SessionAttendanceMeta;
  rows: SessionAttendanceRow[];
}

export interface MarkAttendancePayload {
  marks: Array<{ studentId: string; status: AttendanceStatus; note?: string }>;
}

export interface MarkAttendanceResult {
  succeeded: number;
  failed: number;
}

export interface StudentAttendanceSessionRow {
  sessionId: string;
  title?: string;
  startsAt: string;
  isCancelled: boolean;
  status: AttendanceStatus | null;
  source?: AttendanceSource;
  durationMinutes?: number;
  note?: string;
  markedAt?: string;
}

export interface StudentAttendanceCohortBlock {
  scheduleId: string;
  courseName?: string;
  cohortStartDate?: string;
  summary: {
    held: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    unmarked: number;
    percentage: number;
  };
  sessions: StudentAttendanceSessionRow[];
}

export interface StudentAttendanceHistory {
  student: {
    userId: string;
    studentId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  cohorts: StudentAttendanceCohortBlock[];
}

/** One assignment on a cohort, with what this student did about it.
 *  Mirrors `StudentAssignmentRow` on the API. */
export interface CohortStudentAssignmentRow {
  assignmentId: string;
  title: string;
  type: string;
  moduleId?: string;
  moduleTitle?: string;
  totalPoints?: number;
  isPublished: boolean;
  dueDate?: string;
  allowLateSubmission: boolean;
  status: "graded" | "returned" | "submitted" | "missing" | "pending";
  submittedAt?: string;
  daysLate?: number;
  isLate: boolean;
  submissionId?: string;
  score?: number;
  percentage?: number;
  gradedAt?: string;
}

/** One student's coursework for one cohort, plus who they are. */
export interface CohortStudentAssignments {
  scheduleId?: string;
  courseId: string;
  courseName: string;
  startDate?: string;
  scopedEnrollment: boolean;
  summary: {
    total: number;
    submitted: number;
    graded: number;
    missing: number;
    pending: number;
    late: number;
    averagePercentage?: number;
  };
  assignments: CohortStudentAssignmentRow[];
  student: { id: string; name: string; email?: string; imageUrl?: string };
}
