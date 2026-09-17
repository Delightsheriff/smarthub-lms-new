"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptanceLettersService } from "./acceptance-letters.service";
import { dedupeAcceptanceLetters, normaliseAcceptanceLetter } from "./normalise";
import { STALE_TIME } from "@/lib/query-config";
import { SIWES_PROFILE_QUERY_KEYS } from "@/modules/siwes-profile/api/siwes-profile.queries";

export const ACCEPTANCE_LETTERS_QUERY_KEYS = {
  list: ["acceptance-letters", "list"] as const,
} as const;

export function useAcceptanceLetters() {
  return useQuery({
    queryKey: ACCEPTANCE_LETTERS_QUERY_KEYS.list,
    queryFn: async () => {
      const rows = await acceptanceLettersService.list();
      const normalised = rows.map(normaliseAcceptanceLetter);
      return dedupeAcceptanceLetters(normalised);
    },
    // Letters are issued at most once per applicant; a 60s stale
    // window is plenty to absorb the post-payment auto-issue race
    // without hammering the API.
    staleTime: STALE_TIME.DEFAULT,
  });
}

// Invalidates the list so the new duration (and the regenerated
// letter URL, once the admin reissues) refetches. Success/error
// toasts are emitted by the axios interceptor based on the API
// envelope — don't double-toast from here.
export function useUpdateSiwesDuration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      registrationId,
      siwesDurationMonths,
    }: {
      registrationId: string;
      siwesDurationMonths: number;
    }) =>
      acceptanceLettersService.updateSiwesDuration(
        registrationId,
        siwesDurationMonths,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACCEPTANCE_LETTERS_QUERY_KEYS.list });
      // Also refresh the profile-tab list so the new duration shows
      // up immediately without a page navigation.
      qc.invalidateQueries({ queryKey: SIWES_PROFILE_QUERY_KEYS.myRegistrations });
    },
  });
}