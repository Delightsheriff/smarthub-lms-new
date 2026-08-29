import type { ApiSiwesRegistration } from "../types/api.types";
import type { SiwesRegistration } from "../types";

// Pass-through — the API shape is already small and screen-ready.
// Keeping the normaliser anyway so the module follows the standard
// per-domain layout and screens never import api.types directly.
export const normaliseSiwesRegistration = (
  api: ApiSiwesRegistration,
): SiwesRegistration => ({
  registrationId: api.registrationId,
  siwesDurationMonths: api.siwesDurationMonths,
  siwesDurationEditable: api.siwesDurationEditable,
  schoolName: api.schoolName,
  institutionName: api.institutionName,
});