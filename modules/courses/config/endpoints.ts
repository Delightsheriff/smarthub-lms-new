import { LMS_PREFIX } from "@/lib/api/constants";

/**
 * Student-facing course endpoints, all under `/lms/*` per the
 * smarthub-api Pass-1 namespace. The mock router registers handlers
 * beneath the same prefix.
 */
export const COURSES_ENDPOINTS = {
  ENROLLED: `${LMS_PREFIX}/courses`,
  ENROLLED_DETAIL: (courseSlug: string) =>
    `${LMS_PREFIX}/courses/${courseSlug}`,
  MODULES_BY_COURSE: (courseId: string) =>
    `${LMS_PREFIX}/modules/course/${courseId}`,
  /** Streams PDF bytes, not the JSON envelope — use `getBlob`. */
  CURRICULUM_PDF: (courseSlug: string) =>
    `${LMS_PREFIX}/courses/${courseSlug}/curriculum.pdf`,
} as const;
