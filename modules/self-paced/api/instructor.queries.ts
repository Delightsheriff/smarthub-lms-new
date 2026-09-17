"use client";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuthStore } from "@/store/slices/authStore";
import { selfPacedInstructorService } from "./instructor.service";
import { shouldRetry } from "../lib/access-denial";
import { STALE_TIME } from "@/lib/query-config";

export const SELF_PACED_INSTRUCTOR_KEYS = {
  all: ["self-paced", "instructor"] as const,
  links: ["self-paced", "instructor", "links"] as const,
  orders: (page: number, course?: string) =>
    ["self-paced", "instructor", "orders", page, course ?? ""] as const,
  earnings: (page: number) =>
    ["self-paced", "instructor", "earnings", page] as const,
} as const;

/** Instructor detection: `lmsRole === "instructor" | "both"`. */
export function useTeachesInLms(): boolean {
  const user = useAuthStore((s) => s.user);
  return user?.lmsRole === "instructor" || user?.lmsRole === "both";
}

/**
 * The caller's referral links plus the self-paced courses they're named
 * on without one.
 */
export function useMyInstructorLinks(options?: { enabled?: boolean }) {
  const teaches = useTeachesInLms();
  return useQuery({
    queryKey: SELF_PACED_INSTRUCTOR_KEYS.links,
    queryFn: () => selfPacedInstructorService.getLinks(),
    enabled: teaches && (options?.enabled ?? true),
    staleTime: STALE_TIME.SLOW,
    retry: shouldRetry,
  });
}

/** Issue, or reactivate a revoked, link for one course. */
export function useIssueInstructorLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) =>
      selfPacedInstructorService.issueLink(courseId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: SELF_PACED_INSTRUCTOR_KEYS.links }),
  });
}

export function useRevokeInstructorLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) =>
      selfPacedInstructorService.revokeLink(linkId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: SELF_PACED_INSTRUCTOR_KEYS.links }),
  });
}

export const ORDERS_PAGE_SIZE = 20;

export function useMyAttributedOrders(page: number, course?: string) {
  const teaches = useTeachesInLms();
  return useQuery({
    queryKey: SELF_PACED_INSTRUCTOR_KEYS.orders(page, course),
    queryFn: () =>
      selfPacedInstructorService.getOrders({
        page,
        limit: ORDERS_PAGE_SIZE,
        course,
      }),
    enabled: teaches,
    placeholderData: keepPreviousData,
    retry: shouldRetry,
  });
}

export const SHARES_PAGE_SIZE = 20;

export function useMySelfPacedEarnings(page: number) {
  const teaches = useTeachesInLms();
  return useQuery({
    queryKey: SELF_PACED_INSTRUCTOR_KEYS.earnings(page),
    queryFn: () =>
      selfPacedInstructorService.getEarnings({
        page,
        limit: SHARES_PAGE_SIZE,
      }),
    enabled: teaches,
    placeholderData: keepPreviousData,
    retry: shouldRetry,
  });
}
