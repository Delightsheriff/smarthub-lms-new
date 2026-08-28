import { LMS_PREFIX } from "@/lib/api/constants";

/**
 * Student-facing assignment + submission endpoints. Uploads land on
 * the /lms/uploads/assignment route.
 */
export const ASSIGNMENTS_ENDPOINTS = {
  STUDENT: `${LMS_PREFIX}/assignments`,
  UPCOMING: `${LMS_PREFIX}/assignments/deadlines/upcoming`,
  BY_ID: (id: string) => `${LMS_PREFIX}/assignments/${id}`,
  BY_MODULE: (moduleId: string) => `${LMS_PREFIX}/assignments/module/${moduleId}`,
} as const;

export const SUBMISSIONS_ENDPOINTS = {
  CREATE: `${LMS_PREFIX}/submissions`,
  MY: `${LMS_PREFIX}/submissions/student`,
  BY_ID: (id: string) => `${LMS_PREFIX}/submissions/${id}`,
  HISTORY: (id: string) => `${LMS_PREFIX}/submissions/${id}/history`,
  DOWNLOAD: (id: string) => `${LMS_PREFIX}/submissions/${id}/download`,
  RESUBMIT: (id: string) => `${LMS_PREFIX}/submissions/${id}/resubmit`,
} as const;

export const UPLOAD_ENDPOINTS = {
  ASSIGNMENT_FILE: `${LMS_PREFIX}/uploads/assignment`,
} as const;
