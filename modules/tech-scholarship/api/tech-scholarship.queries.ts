"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/slices/authStore";
import { techScholarshipService } from "./tech-scholarship.service";
import type { ScholarshipBannerUi } from "../types";
import type { ApiScholarshipApplication } from "../types/api.types";

export const SCHOLARSHIP_QUERY_KEYS = {
  me: ["scholarship", "me"] as const,
  banner: ["scholarship", "banner"] as const,
};

export function useMyScholarship({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<ApiScholarshipApplication | null>({
    queryKey: SCHOLARSHIP_QUERY_KEYS.me,
    queryFn: () => techScholarshipService.getMine(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

/**
 * The share banner. Only fetched while the share dialog is open — the
 * endpoint renders images server-side and 409s for anyone without a
 * photo, so it must never run on a plain dashboard load. No retry: a 409
 * is the "add a photo" state, not a transient failure.
 */
export function useScholarshipBanner({ enabled }: { enabled: boolean }) {
  return useQuery<ScholarshipBannerUi>({
    queryKey: SCHOLARSHIP_QUERY_KEYS.banner,
    queryFn: () => techScholarshipService.getBanner(),
    enabled,
    retry: false,
  });
}

export function useRegenerateScholarshipBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => techScholarshipService.getBanner(true),
    onSuccess: (banner) => {
      qc.setQueryData(SCHOLARSHIP_QUERY_KEYS.banner, banner);
    },
  });
}

/**
 * Upload the cropped portrait and persist it. The API sets it as the
 * user's `imageUrl` too, so mirror it into the auth store — that closes
 * the photo gates and updates the avatar without waiting for `/auth/me`.
 */
export function useUpdateScholarshipPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => techScholarshipService.updatePhoto(file),
    onSuccess: (imageUrl) => {
      const { user, setUser } = useAuthStore.getState();
      if (user) setUser({ ...user, imageUrl });
      qc.invalidateQueries({ queryKey: SCHOLARSHIP_QUERY_KEYS.me });
      // The PATCH clears the server's cached banner, so a plain refetch
      // renders a fresh one with the new face (only while it's open).
      qc.invalidateQueries({ queryKey: SCHOLARSHIP_QUERY_KEYS.banner });
    },
  });
}
