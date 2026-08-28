/**
 * Enum literal sets mirrored from `smarthub-api/src/constants/index.ts`.
 *
 * These are the exact literal values the backend emits on the wire, kept
 * in one place so `lib/api/mock/mockDatabase.ts` and every module's
 * normaliser + type files stay aligned with the contract.
 */

/** URL prefix all student-facing LMS routes live under. Module
 *  `config/endpoints.ts` files build their paths from this. The mock
 *  router registers handlers beneath the same prefix. */
export const LMS_PREFIX = "/lms" as const;

export const COHORT_STATUS = {
  UPCOMING: "upcoming",
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
  CANCELLED: "cancelled",
} as const;
export type CohortStatus = (typeof COHORT_STATUS)[keyof typeof COHORT_STATUS];

export const CONTENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  PROCESSING: "processing",
  ARCHIVED: "archived",
} as const;
export type ContentStatus =
  (typeof CONTENT_STATUS)[keyof typeof CONTENT_STATUS];

export const MODE_OPTION = {
  ONLINE: "online",
  OFFLINE: "offline",
  HYBRID: "hybrid",
} as const;
export type ModeOption = (typeof MODE_OPTION)[keyof typeof MODE_OPTION];

export const COURSE_KIND = {
  FULL: "full",
  FOUNDATION: "foundation",
} as const;
export type CourseKind = (typeof COURSE_KIND)[keyof typeof COURSE_KIND];

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_OPTION = {
  INSTALLMENT: "installment",
  FULL: "full",
} as const;
export type PaymentOption =
  (typeof PAYMENT_OPTION)[keyof typeof PAYMENT_OPTION];

export const PAYMENT_PROOF_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
} as const;
export type PaymentProofStatus =
  (typeof PAYMENT_PROOF_STATUS)[keyof typeof PAYMENT_PROOF_STATUS];

export const PAYMENT_PROOF_PURPOSE = {
  COURSE: "course",
  SCHOLARSHIP: "scholarship",
  INTERNSHIP: "internship",
  OTHER: "other",
} as const;
export type PaymentProofPurpose =
  (typeof PAYMENT_PROOF_PURPOSE)[keyof typeof PAYMENT_PROOF_PURPOSE];

export const INSTALLMENT_TYPE = {
  TWICE: "twice",
  MONTHLY: "monthly",
  WEEKLY: "weekly",
} as const;
export type InstallmentType =
  (typeof INSTALLMENT_TYPE)[keyof typeof INSTALLMENT_TYPE];

export const INSTALLMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  OVERDUE: "overdue",
  WAIVED: "waived",
} as const;
export type InstallmentStatus =
  (typeof INSTALLMENT_STATUS)[keyof typeof INSTALLMENT_STATUS];

export const ENROLLMENT_ACCESS_STATUS = {
  ACTIVE: "active",
  SUSPENDED_PAYMENT: "suspended_payment",
  SUSPENDED_OTHER: "suspended_other",
  WITHDRAWN: "withdrawn",
} as const;
export type EnrollmentAccessStatus =
  (typeof ENROLLMENT_ACCESS_STATUS)[keyof typeof ENROLLMENT_ACCESS_STATUS];

export const ENROLLMENT_ROLES = ["student", "observer"] as const;
export type EnrollmentRole = (typeof ENROLLMENT_ROLES)[number];

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  LATE: "late",
  ABSENT: "absent",
  EXCUSED: "excused",
} as const;
export type AttendanceStatus =
  (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export const ATTENDANCE_SOURCE = {
  MEET_REPORT: "meet-report",
  QR_SCAN: "qr-scan",
  TERMINAL_PIN: "terminal-pin",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
} as const;
export type AttendanceSource =
  (typeof ATTENDANCE_SOURCE)[keyof typeof ATTENDANCE_SOURCE];

export const ATTENDANCE_SOURCE_PRECEDENCE: Record<string, number> = {
  "meet-report": 1,
  "qr-scan": 2,
  "terminal-pin": 3,
  instructor: 4,
  admin: 5,
};

export const CALENDAR_EVENT_TYPE = {
  CLASS_SESSION: "class-session",
  ASSIGNMENT_DUE: "assignment-due",
  MATERIAL_REMINDER: "material-reminder",
  OFFICE_HOURS: "office-hours",
  ANNOUNCEMENT: "announcement",
  GENERAL: "general",
} as const;
export type CalendarEventType =
  (typeof CALENDAR_EVENT_TYPE)[keyof typeof CALENDAR_EVENT_TYPE];

export const CALENDAR_EVENT_SOURCE = {
  MANUAL: "manual",
  AUTO: "auto",
} as const;
export type CalendarEventSource =
  (typeof CALENDAR_EVENT_SOURCE)[keyof typeof CALENDAR_EVENT_SOURCE];

export const CALENDAR_EVENT_SCOPE = {
  GLOBAL: "global",
  COURSE: "course",
  SCHEDULE: "schedule",
  MODULE: "module",
  ASSIGNMENT: "assignment",
} as const;
export type CalendarEventScope =
  (typeof CALENDAR_EVENT_SCOPE)[keyof typeof CALENDAR_EVENT_SCOPE];

export const MATERIAL_CATEGORY = {
  GUIDE: "guide",
  PRESENTATION: "presentation",
  EXERCISE: "exercise",
  REFERENCE: "reference",
} as const;
export type MaterialCategory =
  (typeof MATERIAL_CATEGORY)[keyof typeof MATERIAL_CATEGORY];

export const ASSIGNMENT_TYPE = {
  ASSIGNMENT: "assignment",
  TEST: "test",
  MODULE_PROJECT: "module-project",
  COURSE_PROJECT: "course-project",
} as const;
export type AssignmentContentType =
  (typeof ASSIGNMENT_TYPE)[keyof typeof ASSIGNMENT_TYPE];

export const SUBMISSION_STATUS = {
  PENDING: "pending",
  SUBMITTED: "submitted",
  GRADED: "graded",
  LATE: "late",
} as const;
export type SubmissionStatus =
  (typeof SUBMISSION_STATUS)[keyof typeof SUBMISSION_STATUS];

export const INVITATION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;
export type InvitationStatus =
  (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS];

export const INTERNSHIP_APPLICATION_STATUS = [
  "applied",
  "screening",
  "accepted",
  "rejected",
  "withdrawn",
] as const;
export type InternshipApplicationStatus =
  (typeof INTERNSHIP_APPLICATION_STATUS)[number];

export const INTERNSHIP_STATUS = ["active", "completed", "terminated"] as const;
export type InternshipStatus = (typeof INTERNSHIP_STATUS)[number];

export const INTERNSHIP_TASK_STATUS = [
  "todo",
  "in_progress",
  "submitted",
  "done",
] as const;
export type InternshipTaskStatus = (typeof INTERNSHIP_TASK_STATUS)[number];

export const REFERRAL_RECORD_STATUS = [
  "pending",
  "in-progress",
  "earned",
  "paid",
  "clawed-back",
] as const;
export type ReferralRecordStatus = (typeof REFERRAL_RECORD_STATUS)[number];

export const PAYOUT_STATUS = [
  "pending",
  "processing",
  "paid",
  "failed",
  "cancelled",
] as const;
export type PayoutStatus = (typeof PAYOUT_STATUS)[number];

export const PAYOUT_KINDS = ["referral", "instructor"] as const;
export type PayoutKind = (typeof PAYOUT_KINDS)[number];

export const EARNING_STREAMS = [
  "course",
  "siwes",
  "foundational",
  "scholarship",
] as const;
export type EarningStream = (typeof EARNING_STREAMS)[number];

export const COMPENSATION_MODELS = [
  "legacy-50",
  "main-track",
  "micro-intake",
  "foundational",
] as const;
export type CompensationModel = (typeof COMPENSATION_MODELS)[number];

export const INSTRUCTOR_ROLES = [
  "lead",
  "co-instructor",
  "ta",
  "guest",
  "observer",
] as const;
export type InstructorRole = (typeof INSTRUCTOR_ROLES)[number];

export const PAY_ITEM_KINDS = ["payload", "retainer"] as const;
export type PayItemKind = (typeof PAY_ITEM_KINDS)[number];

export const SETTLEMENT_MILESTONES = [
  "enrolment",
  "completion",
  "session",
  "conversion",
] as const;
export type SettlementMilestone = (typeof SETTLEMENT_MILESTONES)[number];

export const INSTRUCTOR_PAY_ITEM_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  CANCELLED: "cancelled",
} as const;
export type InstructorPayItemStatus =
  (typeof INSTRUCTOR_PAY_ITEM_STATUS)[keyof typeof INSTRUCTOR_PAY_ITEM_STATUS];

export const INSTALLMENT_ENFORCEMENT = {
  CHASE: "chase",
  SUSPEND: "suspend",
} as const;
export type InstallmentEnforcement =
  (typeof INSTALLMENT_ENFORCEMENT)[keyof typeof INSTALLMENT_ENFORCEMENT];

export const INSTALLMENT_PLAN_ORIGIN = {
  SCHOLARSHIP: "scholarship",
  COURSE: "course",
} as const;
export type InstallmentPlanOrigin =
  (typeof INSTALLMENT_PLAN_ORIGIN)[keyof typeof INSTALLMENT_PLAN_ORIGIN];

export const INSTALLMENT_PLAN_TYPE = {
  INSTALLMENT: "installment",
  FULL_UPFRONT: "full_upfront",
} as const;
export type InstallmentPlanType =
  (typeof INSTALLMENT_PLAN_TYPE)[keyof typeof INSTALLMENT_PLAN_TYPE];

export const INSTALLMENT_PLAN_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  DEFAULTED: "defaulted",
  CANCELLED: "cancelled",
} as const;
export type InstallmentPlanStatus =
  (typeof INSTALLMENT_PLAN_STATUS)[keyof typeof INSTALLMENT_PLAN_STATUS];

/** Code + label pairs for why an enrollment's access was suspended.
 *  Only the label is rendered by the UI; the code is the wire value. */
export const ACCOUNT_SUSPENSION_REASONS = [
  { code: "payment_due", label: "Payment past due" },
  { code: "failed_payment", label: "Payment failed" },
  { code: "policy", label: "Policy violation" },
  { code: "conduct", label: "Code of conduct" },
] as const;

/** Code + label pairs shown on the admission-revocation letter copy. */
export const ADMISSION_REVOCATION_REASONS = [
  { code: "misrepresentation", label: "Misrepresentation of admission details" },
  { code: "non_payment", label: "Non-payment of fees" },
  { code: "duplicate", label: "Duplicate submission" },
] as const;

export const ROLES = {
  SUPER_ADMIN: "super-admin",
  INSTRUCTOR: "instructor",
  USER: "user",
  ADMIN: "admin",
  MODERATOR: "moderator",
  STUDENT: "student",
  ORGANIZATION: "organization",
  INTERN: "intern",
  AMBASSADOR: "ambassador",
} as const;
export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

export const SCHOLARSHIP_TRACKS = [
  "python-ai",
  "web-dev",
  "data-analysis",
  "cyber",
] as const;
export type ScholarshipTrack = (typeof SCHOLARSHIP_TRACKS)[number];

export const SCHOLARSHIP_STAGES = [
  "applied",
  "aptitude-completed",
  "stage-2-invited",
  "stage-2-submitted",
  "interview-scheduled",
  "interview-completed",
  "admitted",
  "rejected",
  "enrolled",
  "withdrawn",
] as const;
export type ScholarshipStage = (typeof SCHOLARSHIP_STAGES)[number];

export const CONTACT_MESSAGE_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  ATTENDED_TO: "attended_to",
  CLOSED: "closed",
} as const;
export type ContactMessageStatus =
  (typeof CONTACT_MESSAGE_STATUS)[keyof typeof CONTACT_MESSAGE_STATUS];
