import type { ContentLink } from "@/types/content-link";

/** UI-shaped assignment + submission types consumed by every screen. */

export type AssignmentStatus =
  | "draft"
  | "submitted"
  | "graded"
  | "overdue"
  | "returned";

export interface Assignment {
  id: string;
  title: string;
  instructions: string;
  description?: string;
  /** External link the admin attached on creation (brief, Figma, repo). */
  assignmentLink?: string;
  /** All attached links, always populated by the normaliser. */
  links: ContentLink[];
  /** Effective due date; resolved server-side from AssignmentSchedule. */
  dueAt: string;
  allowLateSubmission: boolean;
  totalPoints: number;
  status: AssignmentStatus;
  /** Headline grade percentage when graded. */
  grade?: number;
  type: "assignment" | "test" | "module-project" | "course-project";
  priority: "low" | "medium" | "high";
}

export type SubmissionStatus =
  | "submitted"
  | "graded"
  | "returned"
  | "resubmitted";

export interface SubmissionRubricScore {
  criterion: string;
  score: number;
  totalPoints: number;
  comment?: string;
}

export interface SubmissionHistoryEntry {
  action: "submitted" | "resubmitted" | "graded" | "returned" | string;
  timestamp: string;
  notes?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  userId: string;
  submissionType: "file" | "text" | "url";
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  externalUrl?: string;
  notes?: string;
  status: SubmissionStatus;
  submittedAt: string;
  isLateSubmission: boolean;
  version: number;
  previousVersionId?: string;
  history?: SubmissionHistoryEntry[];
  grade?: {
    score: number;
    totalPoints: number;
    percentage: number;
    letterGrade?: string;
    rubricScores?: SubmissionRubricScore[];
  };
  feedback?: {
    general?: string;
    audioFeedbackUrl?: string;
    videoFeedbackUrl?: string;
  };
  gradedAt?: string;
  gradedBy?: string;
}

export type { ApiSubmission } from "./api.types";
