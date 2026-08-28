/** UI shape for a SIWES placement row — identical to the wire shape. */
export type SiwesRegistration = {
  registrationId: string;
  siwesDurationMonths?: number;
  siwesDurationEditable: boolean;
  schoolName?: string;
  institutionName?: string;
};

export type { ApiSiwesRegistration } from "./api.types";
