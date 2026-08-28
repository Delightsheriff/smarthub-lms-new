/** API-layer barrel. Importing this registers the mock routes and
 *  exposes the data-source seam + mirrored contract. */

import "@/lib/api/mock/router";

export { apiClient } from "@/lib/api/client";
export type {
  ApiClientRequestOptions,
  HttpVerb,
  MockRequestContext,
  MockRoute,
} from "@/lib/api/client";
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
  WireInternship,
  WireInternshipCheckIn,
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
export { mockDatabase } from "@/lib/api/mock/mockDatabase";
