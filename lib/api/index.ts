/** API-layer barrel exposing the data-source seam + mirrored contract. */

export { apiClient, uploadFile } from "@/lib/api/client";
export type { ApiClientRequestOptions } from "@/lib/api/client";
export { ApiError } from "@/lib/api/types";
export type {
  ApiErrorResponse,
  ApiResponse,
  PaginationMeta,
} from "@/lib/api/types";
export * from "@/lib/api/constants";
export type {
  WireAssignment,
  WireAttendanceRow,
  WireAttendanceSession,
  WireBillingBreakdown,
  WireBillingRegistration,
  WireCalendarEvent,
  WireConversation,
  WireEnrolledCourse,
  WireHelpResource,
  WireInternship,
  WireInternshipCheckIn,
  WireInternshipPayment,
  WireInternshipTask,
  WireMaterial,
  WireMessage,
  WireModule,
  WireModuleRef,
  WireNotification,
  WireRecording,
  WireSubmission,
  WireSubmissionGrade,
  WireTeachingCohort,
  WireUser,
  WireWebinar,
} from "@/lib/api/wire.types";
