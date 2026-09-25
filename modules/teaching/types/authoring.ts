import type { ContentLink } from "@/types/content-link";

/** Payload/wire types for the instructor authoring surface. Field names
 *  mirror smarthub-api's validators (assignment-validators/*,
 *  materials.validators.ts, recordings.validators.ts). */

export type AssignmentKind =
  | "assignment"
  | "test"
  | "module-project"
  | "course-project";

export type AssignmentPriority = "low" | "medium" | "high";

export interface CreateAssignmentPayload {
  title: string;
  instructions?: string;
  description?: string;
  module: string;
  type?: AssignmentKind;
  priority?: AssignmentPriority;
  totalPoints?: number;
  allowLateSubmission?: boolean;
  isPublished?: boolean;
  assignmentLink?: string;
  links?: ContentLink[];
}

export type UpdateAssignmentPayload = Partial<CreateAssignmentPayload>;

export interface AttachAssignmentToSchedulePayload {
  dueDate: string;
  allowLateSubmission?: boolean;
  customTitle?: string;
  customInstructions?: string;
  notifyStudents?: boolean;
  /** Honoured only when the cohort has a live Slack channel. */
  notifySlack?: boolean;
}

/** `PATCH /lms/assignments/:id/schedules/:scheduleId` — every field optional. */
export interface UpdateAssignmentSchedulePayload {
  dueDate?: string;
  allowLateSubmission?: boolean;
  customTitle?: string;
  customInstructions?: string;
  isVisible?: boolean;
  notifySlack?: boolean;
}

export interface ApiAssignmentDetail {
  _id: string;
  title: string;
  description?: string;
  instructions?: string;
  type?: AssignmentKind;
  priority?: AssignmentPriority;
  totalPoints?: number;
  allowLateSubmission?: boolean;
  isPublished?: boolean;
  assignmentLink?: string;
  links?: ContentLink[];
  module?: { _id?: string; title?: string } | string;
}

export type RecordingType = "module" | "passedClass";

export interface CreateRecordingPayload {
  title: string;
  description?: string;
  recordingType: RecordingType;
  /** Optional when `links` has one — the API derives videoUrl from links[0]. */
  videoUrl?: string;
  links?: ContentLink[];
  module?: string;
  duration?: number;
  thumbnailUrl?: string;
  /** Students only see published recordings; the form always sends true. */
  publish?: boolean;
}

export type UpdateRecordingPayload = Partial<CreateRecordingPayload>;

export interface ApiRecordingDetail {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  links?: ContentLink[];
  recordingType?: RecordingType;
  module?: { _id?: string; title?: string } | string;
  duration?: number;
  thumbnailUrl?: string;
  status?: string;
  createdAt?: string;
  recordedAt?: string;
}

export interface CreateMaterialPayload {
  title: string;
  description?: string;
  category: string;
  module: string;
  /** A material is a file, a rich-text guide, or both (API enforces one). */
  fileUrl?: string;
  links?: ContentLink[];
  fileType?: string;
  fileSize?: number;
  isPublic?: boolean;
}

export type UpdateMaterialPayload = Partial<CreateMaterialPayload>;

export interface ApiMaterialDetail {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  fileUrl?: string;
  links?: ContentLink[];
  fileType?: string;
  fileSize?: number;
  isPublic?: boolean;
  module?: { _id?: string; title?: string } | string;
  createdAt?: string;
}

export interface CohortSlackStatus {
  connected: boolean;
  channelName?: string;
}

/** Wire rows for the module library / my-modules reads. */
export interface ApiModuleAssignmentRow {
  assignmentId: string;
  title: string;
  description?: string;
  totalPoints?: number;
  allowLateSubmission?: boolean;
  isPublished?: boolean;
  attachedScheduleIds?: string[];
}

export interface ApiInstructorModule {
  moduleId: string;
  title?: string;
  slug?: string;
  cohorts?: {
    scheduleId: string;
    scheduleName?: string;
    courseId: string;
    courseName?: string;
    startDate?: string;
  }[];
}

/** `module` arrives populated or as a bare id depending on the route. */
export function refId(
  ref: { _id?: string } | string | undefined | null,
): string | undefined {
  if (!ref) return undefined;
  return typeof ref === "string" ? ref : ref._id;
}
