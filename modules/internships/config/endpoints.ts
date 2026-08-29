/**
 * Internship endpoints. Placement, task + check-in lifecycle, and the
 * payment surface (fee, bank details, receipt upload).
 */
export const INTERNSHIP_ENDPOINTS = {
  ME: "/lms/internships/me",
  PAYMENT: "/lms/internships/me/payment",
  PAYMENT_PROOF: "/lms/internships/me/payment-proof",
} as const;

/** `/lms/internships/me/tasks/{taskId}` */
export const internshipTaskPath = (taskId: string): string =>
  `/lms/internships/me/tasks/${taskId}`;

/** `/lms/internships/me/check-ins` */
export const INTERNSHIP_CHECK_INS_PATH = "/lms/internships/me/check-ins";