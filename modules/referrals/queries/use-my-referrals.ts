"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { referralsService } from "../api/referrals.service";
import type {
  BankingDetails,
  Payout,
  PayoutsListResponse,
  ReferralsResponse,
} from "../types";

export const REFERRALS_QUERY_KEYS = {
  me: ["referrals", "me"] as const,
  referrals: ["referrals", "list"] as const,
  applications: ["referrals", "applications"] as const,
  banking: ["referrals", "banking"] as const,
  payouts: (page: number, pageSize: number) =>
    ["referrals", "payouts", page, pageSize] as const,
} as const;

export function useMyReferrals() {
  return useQuery<ReferralsResponse>({
    queryKey: REFERRALS_QUERY_KEYS.referrals,
    queryFn: () => referralsService.getReferrals(),
  });
}

export function useBankingDetails() {
  return useQuery<BankingDetails>({
    queryKey: REFERRALS_QUERY_KEYS.banking,
    queryFn: () => referralsService.getBanking(),
  });
}

export function useMyPayouts(page = 1, pageSize = 20) {
  return useQuery<PayoutsListResponse>({
    queryKey: REFERRALS_QUERY_KEYS.payouts(page, pageSize),
    queryFn: () => referralsService.getPayouts(page, pageSize),
  });
}

export function useRequestPayout() {
  const qc = useQueryClient();
  return useMutation<Payout, Error, void>({
    mutationFn: () => referralsService.requestPayout(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REFERRALS_QUERY_KEYS.payouts(1, 20) });
      qc.invalidateQueries({ queryKey: REFERRALS_QUERY_KEYS.referrals });
    },
  });
}

export function useCancelPayout() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => referralsService.cancelPayout(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REFERRALS_QUERY_KEYS.payouts(1, 20) });
      qc.invalidateQueries({ queryKey: REFERRALS_QUERY_KEYS.referrals });
    },
  });
}
