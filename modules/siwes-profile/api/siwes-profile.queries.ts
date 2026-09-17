"use client";
import { useQuery } from "@tanstack/react-query";
import { siwesProfileService } from "./siwes-profile.service";
import { STALE_TIME } from "@/lib/query-config";

export const SIWES_PROFILE_QUERY_KEYS = {
  myRegistrations: ["siwes-profile", "my-registrations"] as const,
} as const;

// Mirrors the staleTime used by the acceptance-letters list — the
// underlying registration rows change rarely (only on admin action
// or the student's own duration edit), and the mutation in
// acceptance-letters already invalidates its own list. We invalidate
// this key from the dialog's mutation too so the profile tab refreshes
// instantly after an edit.
export function useMySiwesRegistrations() {
  return useQuery({
    queryKey: SIWES_PROFILE_QUERY_KEYS.myRegistrations,
    queryFn: () => siwesProfileService.listMySiwesRegistrations(),
    staleTime: STALE_TIME.DEFAULT,
  });
}