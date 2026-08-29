import type { ApiAcceptanceLetter } from "../types/api.types";
import type { AcceptanceLetter } from "../types";

export const normaliseAcceptanceLetter = (
  api: ApiAcceptanceLetter,
): AcceptanceLetter => ({
  registrationId: api.registrationId,
  url: api.url,
  refNumber: api.refNumber,
  issuedAt: new Date(api.issuedAt),
  courseName: api.courseName,
  institutionName: api.institutionName,
  durationMonths: api.durationMonths,
  durationEditable: api.durationEditable,
});

/**
 * Post-Architecture-A, the per-applicant letter service writes the
 * same letter URL + ref to every Registration row owned by the
 * applicant — so a student enrolled in N SIWES courses sees N
 * identical entries. Dedupe by `refNumber` so the dashboard renders
 * ONE card per applicant-level letter covering all programmes. Falls
 * back to `url` when refNumber is somehow blank (legacy data); falls
 * back to `registrationId` last so nothing is silently dropped.
 */
export const dedupeAcceptanceLetters = (
  letters: AcceptanceLetter[],
): AcceptanceLetter[] => {
  const seen = new Set<string>();
  const deduped: AcceptanceLetter[] = [];
  for (const l of letters) {
    const key = l.refNumber || l.url || l.registrationId;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(l);
  }
  return deduped;
};