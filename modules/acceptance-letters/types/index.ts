/** UI shape for an acceptance letter — `issuedAt` normalised to `Date`. */
export interface AcceptanceLetter {
  registrationId: string;
  url: string;
  refNumber: string;
  issuedAt: Date;
  courseName?: string;
  institutionName?: string;
  durationMonths?: number;
  durationEditable?: boolean;
}

export type { ApiAcceptanceLetter } from "./api.types";
