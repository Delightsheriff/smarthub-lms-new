/**
 * Wire shape for a student's SIWES registration (GET /lms/me/siwes-registrations).
 * Passed through verbatim by the passthrough normaliser.
 */
export interface ApiSiwesRegistration {
  registrationId: string;
  siwesDurationMonths?: number;
  siwesDurationEditable: boolean;
  schoolName?: string;
  institutionName?: string;
}
