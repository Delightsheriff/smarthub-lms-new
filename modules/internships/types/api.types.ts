import type {
  WireInternship,
  WireInternshipCheckIn,
  WireInternshipPayment,
  WireInternshipTask,
} from "@/lib/api/wire.types";

/**
 * smarthub-api shapes for the internship workspace + payment surfaces.
 * These are the centralised `Wire*` records (see `lib/api/wire.types.ts`);
 * re-exported here so internship-side code reads through the module seam
 * only.
 */
export type ApiInternship = WireInternship;
export type ApiInternshipTask = WireInternshipTask;
export type ApiInternshipCheckIn = WireInternshipCheckIn;

export type ApiInternshipPayment = WireInternshipPayment;

/** `POST /lms/internships/me/check-ins` returns the created check-in. */
export type ApiCreateCheckInInput = {
  weekOf: string;
  summary: string;
  blockers?: string;
  hoursLogged?: number;
};

/** `POST /lms/internships/me/payment-proof` — the receipt was already
 *  uploaded via the storage seam; this just records it. */
export type ApiSubmitPaymentProofInput = {
  proofUrl: string;
  reference?: string;
};