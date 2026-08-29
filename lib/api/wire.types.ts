/**
 * Wire-shape type definitions mirrored from `smarthub-api` Mongoose
 * models (see `smarthub-api/src/models/*.ts`). These are the shapes the
 * backend emits — string `_id`s, nested sub-docs, `links[]` — kept
 * identical so `lib/api/mock/mockDatabase.ts` stores realistic records
 * and each module's `normalise.ts` maps them to its small UI types.
 *
 * Note: `ContentLink` lives in `types/content-link.ts`; enums in
 * `lib/api/constants.ts`.
 */

import type { ContentLink } from "@/types/content-link";
import type { AttendanceStatus, AttendanceSource } from "./constants";

export interface WireUser {
  _id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  imageUrl?: string;
  roles?: string[];
  isVerified?: boolean;
  gender?: "Male" | "Female";
  country?: { isoCode?: string; name?: string } | string;
  state?: { isoCode?: string; name?: string } | string;
  city?: string;
  address?: string;
  createdAt?: string;
  isITStudent?: boolean;
  itVerificationStatus?: string;
  siwesYear?: number;
  institution?: string;
  department?: string;
  studentCode?: string;
  jobTitle?: string;
  bio?: string;
  altPhone?: string;
  timeZone?: string;
}

/** Financial/account fixtures added by Plan 009 (Profile & Referrals). */
export interface WirePaymentProofFixture {
  _id: string;
  purpose: string;
  courseName?: string;
  amountClaimed: number;
  confirmedAmount?: number;
  screenshotUrl: string;
  reference?: string;
  status: "pending" | "confirmed" | "rejected";
  reviewNotes?: string;
  createdAt?: string;
  reviewedAt?: string;
}

export interface WireInstallmentTrancheFixture {
  id: string;
  sequence: number;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue" | "waived";
  paidAt?: string;
  graceEndsAt?: string;
}

export interface WireInstallmentPlanFixture {
  id: string;
  enrollmentId: string;
  courseName?: string;
  origin: string;
  planType: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  amountDue: number;
  accessStatus: string;
  nextDue?: WireInstallmentTrancheFixture;
  installments: WireInstallmentTrancheFixture[];
}

export interface WireSiwesRegistrationFixture {
  registrationId: string;
  siwesDurationMonths?: number;
  siwesDurationEditable: boolean;
  schoolName?: string;
  institutionName?: string;
}

export interface WireAcceptanceLetterFixture {
  registrationId: string;
  url: string;
  refNumber: string;
  issuedAt: string;
  courseName?: string;
  institutionName?: string;
  durationMonths?: number;
  durationEditable?: boolean;
}


export interface WireInstructor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  imageUrl?: string;
  bio?: string;
  jobTitle?: string;
  whatsapp?: string | null;
}

export interface WireCourseRef {
  _id: string;
  name?: string;
  nameSlug?: string;
  color?: string;
  bgColor?: string;
}

export interface WireModuleRef {
  _id: string;
  title?: string;
  titleSlug?: string;
  order?: number;
}

/** Course + one enrolment, as returned by the enrolled-courses list. */
export interface WireEnrolledCourse {
  _id: string;
  name: string;
  nameSlug: string;
  description?: string;
  thumbnail?: string;
  imageUrl?: string;
  category?: string;
  difficulty?: string;
  enrollment: {
    _id: string;
    enrollmentDate: string;
    status:
      | "active"
      | "completed"
      | "paused"
      | "dropped"
      | "inactive"
      | "pending_payment";
    progress: number;
    lastAccessedAt?: string;
    schedule: {
      _id: string;
      startDate: string;
      endDate?: string;
      mode?: "online" | "onsite" | "hybrid";
      instructors?: WireInstructor[];
    };
  };
  modules: Array<{
    _id: string;
    title: string;
    titleSlug?: string;
    order: number;
    isPublished: boolean;
  }>;
  instructor?: WireInstructor;
  instructors?: WireInstructor[];
  moduleStats: { total: number; completed: number };
  mode?: string;
  courseKind?: string;
}

export interface WireModule {
  _id: string;
  title: string;
  titleSlug?: string;
  description?: string;
  status?: "draft" | "published" | "archived";
  order?: number;
  estimatedDuration?: number;
  learningObjectives?: string[];
  cohortStatus?: "not-started" | "in-progress" | "completed";
  cohortStartedAt?: string | null;
  cohortCompletedAt?: string | null;
  recordings?: WireRecording[];
  materials?: WireMaterial[];
  assignments?: WireAssignment[];
}

export interface WireRecording {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  links?: ContentLink[];
  thumbnailUrl?: string;
  duration?: number;
  durationLabel?: string;
  createdAt?: string;
  publishedAt?: string;
  status?: "draft" | "published" | "archived";
  watched?: boolean;
  isLockedForViewer?: boolean;
}

export interface WireMaterial {
  _id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  links?: ContentLink[];
  fileType?: string;
  fileSize?: number;
  category?: string;
  tags?: string[];
}

export interface WireAssignment {
  _id: string;
  title: string;
  description?: string;
  instructions?: string;
  assignmentLink?: string;
  links?: ContentLink[];
  type?: "assignment" | "test" | "module-project" | "course-project";
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  totalPoints?: number;
  allowLateSubmission?: boolean;
  status?: "draft" | "submitted" | "graded" | "overdue" | "returned";
  module?: string;
  course?: string;
}

export interface WireSubmissionGrade {
  score: number;
  totalPoints: number;
  percentage: number;
  letterGrade?: string;
  rubricScores?: Array<{
    criterion: string;
    score: number;
    totalPoints: number;
    comment?: string;
  }>;
}

export interface WireSubmission {
  _id: string;
  assignment: string;
  user: string;
  course?: string;
  module?: string;
  submissionType: "file" | "text" | "url";
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  externalUrl?: string;
  attachments?: Array<{ fileName: string; fileUrl: string; fileSize?: number }>;
  notes?: string;
  status: "submitted" | "graded" | "returned" | "resubmitted";
  submittedAt: string;
  isLateSubmission: boolean;
  version: number;
  previousVersionId?: string;
  submissionHistory?: Array<{ action: string; timestamp: string; notes?: string }>;
  grade?: WireSubmissionGrade;
  feedback?: {
    general?: string;
    audioFeedbackUrl?: string;
    videoFeedbackUrl?: string;
  };
  gradedAt?: string;
  gradedBy?: string;
}

export interface WireConversation {
  _id: string;
  type: "direct" | "group" | "assignment" | "announcement" | "support";
  participants: WireUser[];
  lastMessage?: WireMessage | null;
  unreadCount?: Record<string, number>;
  updatedAt: string;
  metadata?: {
    assignmentId?: WireAssignmentRef | string | null;
    courseId?: WireCourseRef | string | null;
    moduleId?: WireModuleRef | string | null;
  };
}

export interface WireMessage {
  _id: string;
  conversationId: string;
  sender: string | Pick<WireUser, "_id" | "firstName" | "lastName" | "email" | "imageUrl">;
  content: string;
  type?: "text" | "file" | "audio" | "video" | "system";
  createdAt: string;
  isDeleted?: boolean;
}

export interface WireAssignmentRef {
  _id: string;
  title?: string;
}

export interface WireCalendarEvent {
  _id: string;
  type: string;
  source: "manual" | "auto";
  title: string;
  description?: string;
  link?: string;
  location?: string;
  start: string;
  end?: string;
  allDay: boolean;
  scope: "global" | "course" | "schedule" | "module" | "assignment";
  scopeId?: string;
  isCancelled: boolean;
  sourceRef?: { model: string; id: string };
  meta?: { courseName?: string; moduleTitle?: string } & Record<string, unknown>;
}

export interface WireNotification {
  _id: string;
  type: string;
  title: string;
  body?: string;
  message?: string;
  description?: string;
  createdAt: string;
  isRead?: boolean;
  read?: boolean;
  actionUrl?: string;
}

export interface WireBillingRegistration {
  _id: string;
  course: { _id?: string; name?: string; nameSlug?: string; mode?: string } | null;
  schedule: { _id?: string; startDate?: string; duration?: string } | null;
  paymentStatus: "pending" | "completed" | "cancelled" | "refunded" | string;
  paymentOption: "installment" | "full" | string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  coursePrice?: number;
  discountAmount?: number;
  discountKind?: "amount" | "percent";
  discountValue?: number;
  discountReason?: string;
  discountNote?: string;
  nextPaymentDue?: string | null;
  payments: Array<{ _id: string; amount: number; paymentDate: string }>;
}

export interface WireBillingBreakdown {
  overall: {
    totalPaid: number;
    totalDue: number;
    totalAmount: number;
    totalDiscount?: number;
    paymentProgress: number;
    nextPaymentDue?: string | null;
  };
  registrations: WireBillingRegistration[];
}

export interface WireWebinar {
  _id: string;
  title: string;
  nameSlug: string;
  description: string;
  date: string;
  speakers: string[];
  tags: string[];
  watchLink?: string;
  liveLink?: string;
  recordingLink?: string;
  posterUrl: string;
  isAvailable: boolean;
  reservationsOpen: boolean;
  externalResources?: Array<{ title: string; description?: string; link: string }>;
}

export interface WireInternshipTask {
  _id: string;
  internship: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "submitted" | "done";
  dueDate?: string;
  order: number;
  submissionUrl?: string;
  submissionNote?: string;
  submittedAt?: string;
  reviewNotes?: string;
}

export interface WireInternshipCheckIn {
  _id: string;
  weekOf?: string;
  summary: string;
  blockers?: string;
  hoursLogged?: number;
  submittedAt?: string;
  mentorFeedback?: string;
}

export interface WireInternshipPayment {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  fee: number;
  paidAmount: number;
  paymentStatus: "pending" | "completed" | "cancelled";
  paymentProofUrl?: string;
  paymentProofSubmittedAt?: string;
  paymentReference?: string;
  paymentConfirmedAt?: string;
  bank?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    paymentInstructions?: string;
  };
}

export interface WireHelpResource {
  _id: string;
  title: string;
  description?: string;
  type: "video" | "document" | "link";
  url: string;
  thumbnailUrl?: string;
  category: string;
  audience: "student" | "instructor" | "all";
  order: number;
  createdAt: string;
}

export interface WireInternship {
  _id: string;
  internName: string;
  internEmail: string;
  product: { key: string; name: string };
  mentor: { name: string; email?: string; title?: string };
  startDate?: string;
  endDate?: string;
  status: "active" | "completed" | "terminated";
  progressPercent: number;
  checkIns: WireInternshipCheckIn[];
  certificateUrl?: string;
  certificateRefNumber?: string;
  certificateIssuedAt?: string;
  completedAt?: string;
  tasks?: WireInternshipTask[];
}

export interface WireScholarshipApplication {
  _id: string;
  cohort: string;
  track: string;
  stage:
    | "applied"
    | "aptitude-completed"
    | "stage-2-invited"
    | "stage-2-submitted"
    | "interview-scheduled"
    | "interview-completed"
    | "admitted"
    | "rejected"
    | "enrolled"
    | "withdrawn";
  awardedTier?: string | null;
  siwesCouponCode?: string | null;
  createdAt?: string;
}

export interface WireAttendanceSession {
  _id: string;
  scheduleId: string;
  startsAt: string;
  durationMinutes: number;
  title: string;
  location?: string;
  link?: string;
  isCancelled?: boolean;
}

export interface WireAttendanceRow {
  studentId: string;
  enrollmentId: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  status?: AttendanceStatus;
  source?: AttendanceSource;
  durationMinutes?: number;
  note?: string;
  markedAt?: string;
}

export interface WireTeachingCohort {
  _id: string;
  startDate: string;
  endDate?: string;
  duration?: string;
  applicationIsOpen?: boolean;
  applicationEndDate?: string;
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

export {};
