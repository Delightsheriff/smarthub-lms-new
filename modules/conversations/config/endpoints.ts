import { LMS_PREFIX } from "@/lib/api/constants";

export const CONVERSATIONS_ENDPOINTS = {
  LIST: `${LMS_PREFIX}/conversations`,
  MARK_READ: (id: string) => `${LMS_PREFIX}/conversations/${id}/read`,
  /** POST {assignmentId, courseId, moduleId?} → find-or-create the
   *  student's thread with the course staff for one assignment. */
  ASSIGNMENT: `${LMS_PREFIX}/conversations/assignment`,
} as const;
