import type {
  ApiInternship,
  ApiInternshipCheckIn,
  ApiInternshipPayment,
  ApiInternshipTask,
} from "./api.types";

/** Check-in list sorted newest-first for the workspace. */
export type InternshipCheckInUi = ApiInternshipCheckIn;

export type InternshipPaymentUi = ApiInternshipPayment;

export interface InternshipWorkspaceUi {
  internship: ApiInternship;
  /** Tasks preserved in document order with `progressPercent` derived. */
  tasks: ApiInternshipTask[];
  /** Sorted newest-first. */
  checkIns: InternshipCheckInUi[];
  progressPercent: number;
}

export interface InternshipTaskUpdateInput {
  status: "in_progress" | "submitted";
  submissionUrl?: string;
  submissionNote?: string;
}

export interface InternshipCheckInInput {
  weekOf: string;
  summary: string;
  blockers?: string;
  hoursLogged?: number;
}

export interface InternshipPaymentProofInput {
  file: File;
  reference?: string;
}