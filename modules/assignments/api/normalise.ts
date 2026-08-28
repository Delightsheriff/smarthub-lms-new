import {
  normaliseAssignment as normaliseAssignmentBase,
} from "@/modules/learning/api/normalise";
import type { ApiAssignment } from "@/modules/learning/types/api.types";
import type { Assignment, Submission } from "../types";
import type { ApiSubmission } from "../types/api.types";

/** Re-export so assignment-side code can use a single import path. */
export const normaliseAssignment = normaliseAssignmentBase;
export type { ApiAssignment, Assignment };

export function normaliseSubmission(api: ApiSubmission): Submission {
  return {
    id: api._id,
    assignmentId: api.assignment,
    userId: api.user,
    submissionType: api.submissionType,
    content: api.content,
    fileUrl: api.fileUrl,
    fileName: api.fileName,
    fileSize: api.fileSize,
    fileMimeType: api.fileMimeType,
    externalUrl: api.externalUrl,
    notes: api.notes,
    status: api.status,
    submittedAt: api.submittedAt,
    isLateSubmission: !!api.isLateSubmission,
    version: api.version,
    previousVersionId: api.previousVersionId,
    history: (api.submissionHistory || []).map((h) => ({
      action: h.action,
      timestamp: h.timestamp,
      notes: h.notes,
    })),
    grade: api.grade,
    feedback: api.feedback,
    gradedAt: api.gradedAt,
    gradedBy: api.gradedBy,
  };
}
