"use client";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/slices/authStore";
import { profileService } from "./profile.service";
import type {
  BankingDetails,
  BankingDetailsPatch,
  ProfileDetailsPatch,
  ProfessionalProfilePatch,
} from "../types";

export const PROFILE_QUERY_KEYS = {
  banking: ["profile", "banking"] as const,
  me: ["auth", "me"] as const,
} as const;

/**
 * Fold the patched fields into the cached AuthUser so the whole shell
 * re-renders without a refetch, then invalidate `/auth/me` for any
 * other reader.
 */
export function useUpdateMyDetails() {
  const qc = useQueryClient();
  const { update: updateSession } = useSession();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation<{ ok: true }, Error, ProfileDetailsPatch>({
    mutationFn: (patch) => profileService.updateDetails(patch),
    onSuccess: async (_data, patch) => {
      if (user) {
        const nextUser = {
          ...user,
          ...(patch.firstName !== undefined && { firstName: patch.firstName }),
          ...(patch.middleName !== undefined && { middleName: patch.middleName }),
          ...(patch.lastName !== undefined && { lastName: patch.lastName }),
          ...(patch.gender !== undefined && { gender: patch.gender }),
          ...(patch.phone !== undefined && { phone: patch.phone }),
          ...(patch.imageUrl !== undefined && { imageUrl: patch.imageUrl }),
        };
        setUser(nextUser);
        try {
          await updateSession({ user: nextUser });
        } catch {
          // ignore session update errors
        }
      }
      qc.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.me });
    },
  });
}

export function useUpdateMyProfessionalProfile() {
  const qc = useQueryClient();
  return useMutation<{ ok: true }, Error, ProfessionalProfilePatch>({
    mutationFn: (patch) => profileService.updateProfessional(patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.me });
    },
  });
}

export function useMyBankingDetails() {
  return useQuery<BankingDetails>({
    queryKey: PROFILE_QUERY_KEYS.banking,
    queryFn: () => profileService.getBanking(),
  });
}

export function useUpdateMyBankingDetails() {
  const qc = useQueryClient();
  return useMutation<BankingDetails, Error, BankingDetailsPatch>({
    mutationFn: (patch) => profileService.updateBanking(patch),
    onSuccess: (data) => {
      qc.setQueryData(PROFILE_QUERY_KEYS.banking, data);
      qc.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.banking });
    },
  });
}
