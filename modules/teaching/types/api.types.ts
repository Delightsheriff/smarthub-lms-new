export interface ApiTeachingCohort {
  _id: string;
  startDate: string;
  endDate?: string;
  duration?: string;
  applicationIsOpen?: boolean;
  applicationEndDate?: string;
  /** Cohort-level delivery mode — wins over `course.mode` when both are
   *  set (two cohorts of one course can be taught differently). */
  mode?: string;
  /** A private cohort looks identical to a public one otherwise. */
  isPrivate?: boolean;
  studentCount: number;
  progress?: number;
  course?: {
    _id: string;
    name: string;
    nameSlug?: string;
    mode?: string;
    imageUrl?: string;
    description?: string;
  };
}

export interface ApiInboxRow {
  _id: string;
  assignment: { _id: string; title?: string; totalPoints?: number };
  cohort: { _id: string; courseName?: string; startDate?: string };
  student: { _id: string; name: string; email?: string };
  submittedAt?: string;
  isLate: boolean;
  /** Populated when the caller asked for `status=all` and the
   *  submission has been graded. */
  score?: number;
  status?: string;
  /** Submission content — drives the GradingDialog preview panel. */
  submissionType?: "file" | "text" | "url";
  fileUrl?: string;
  fileName?: string;
  fileMimeType?: string;
  externalUrl?: string;
  content?: string;
}

export interface ApiTeachingCohortDetail extends ApiTeachingCohort {
  instructors?: Array<{ _id: string; firstName?: string; lastName?: string }>;
  modules?: Array<{
    _id: string;
    title?: string;
    titleSlug?: string;
    description?: string;
    learningObjectives?: string[];
    estimatedDuration?: string;
    order?: number;
    assignmentCount?: number;
    recordingCount?: number;
    materialCount?: number;
  }>;
}
