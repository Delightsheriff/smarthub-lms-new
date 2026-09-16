import { LMS_PREFIX } from "@/lib/api/constants";

/** Student-facing job board, under `/lms/jobs/*`. */
export const JOBS_ENDPOINTS = {
  LIST: `${LMS_PREFIX}/jobs`,
  COMPANIES: `${LMS_PREFIX}/jobs/companies`,
  DETAIL: (id: string) => `${LMS_PREFIX}/jobs/${id}`,
} as const;
