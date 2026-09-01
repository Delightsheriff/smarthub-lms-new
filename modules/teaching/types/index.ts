export interface TeachingCohort {
  id: string;
  startDate: string;
  endDate?: string;
  duration?: string;
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

export type { ApiTeachingCohort, ApiTeachingCohortDetail } from "./api.types";
