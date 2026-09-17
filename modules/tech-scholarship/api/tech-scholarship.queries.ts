"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { techScholarshipService } from "./tech-scholarship.service";
import type { ScholarshipBannerUi } from "../types";
import type { ApiScholarshipApplication } from "../types/api.types";

export const SCHOLARSHIP_QUERY_KEYS = {
  me: ["scholarship", "me"] as const,
  banner: ["scholarship", "banner"] as const,
};

export function useMyScholarship() {
  return useQuery<ApiScholarshipApplication | null>({
    queryKey: SCHOLARSHIP_QUERY_KEYS.me,
    queryFn: () => techScholarshipService.getMine(),
  });
}

export function useScholarshipBanner() {
  return useQuery<ScholarshipBannerUi>({
    queryKey: SCHOLARSHIP_QUERY_KEYS.banner,
    queryFn: () => techScholarshipService.getBanner().then((b) => b),
  });
}

export function useRegenerateScholarshipBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => techScholarshipService.getBanner(true),
    onSuccess: (banner) => {
      qc.setQueryData(SCHOLARSHIP_QUERY_KEYS.banner, banner);
      qc.invalidateQueries({ queryKey: SCHOLARSHIP_QUERY_KEYS.me });
    },
  });
}

export function useUpdateScholarshipPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => techScholarshipService.updatePhoto(file),
    onSuccess: () => {
      // The photo feeds future banner generations — refresh it and the
      // auth image so the banner has a face next open.
      qc.invalidateQueries({ queryKey: SCHOLARSHIP_QUERY_KEYS.me });
      qc.invalidateQueries({ queryKey: SCHOLARSHIP_QUERY_KEYS.banner });
    },
  });
}