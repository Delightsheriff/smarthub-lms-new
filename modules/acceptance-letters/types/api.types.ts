/**
 * Wire shape for an acceptance letter (GET /lms/acceptance-letters).
 * `issuedAt` is an ISO string on the wire; `normalise.ts` hands the UI a
 * `Date`.
 */
export interface ApiAcceptanceLetter {
  registrationId: string;
  url: string;
  refNumber: string;
  issuedAt: string;
  courseName?: string;
  institutionName?: string;
  durationMonths?: number;
  durationEditable?: boolean;
}
