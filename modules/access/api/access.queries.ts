"use client";
import { useQuery } from "@tanstack/react-query";
import { accessService } from "./access.service";
import { STALE_TIME } from "@/lib/query-config";

export const ACCESS_QUERY_KEYS = {
  status: ["access", "status"] as const,
};

/**
 * Cheap and cached — it renders on the dashboard and courses screens,
 * and the answer only changes when an admin revokes or restores.
 */
export function useAccessStatus() {
  return useQuery({
    queryKey: ACCESS_QUERY_KEYS.status,
    queryFn: () => accessService.status(),
    staleTime: STALE_TIME.SLOW,
    // A learner with no active enrolment still needs the answer, so a
    // failure here must not cascade into a retry storm behind a 403.
    retry: false,
  });
}
