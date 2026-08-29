"use client";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { internshipsService } from "./internships.service";
import { normaliseWorkspace } from "./normalise";
import type { InternshipWorkspaceUi } from "../types";
import type { ApiInternship, ApiInternshipPayment } from "../types/api.types";

export const INTERNSHIP_QUERY_KEYS = {
  mine: ["internships", "mine"] as const,
  payment: ["internships", "payment"] as const,
};

export function useInternshipWorkspace() {
  return useQuery<InternshipWorkspaceUi | null>({
    queryKey: INTERNSHIP_QUERY_KEYS.mine,
    queryFn: async () =>
      normaliseWorkspace(await internshipsService.getMine()),
  });
}

export function useInternshipPayment() {
  return useQuery<ApiInternshipPayment | null>({
    queryKey: INTERNSHIP_QUERY_KEYS.payment,
    queryFn: () => internshipsService.getMyPayment(),
  });
}

export function useUpdateInternshipTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      taskId: string;
      status: "in_progress" | "submitted";
      submissionUrl?: string;
      submissionNote?: string;
    }) =>
      internshipsService.updateTask(input.taskId, {
        status: input.status,
        submissionUrl: input.submissionUrl,
        submissionNote: input.submissionNote,
      }),
    onSuccess: (result: ApiInternship) => {
      qc.setQueryData(INTERNSHIP_QUERY_KEYS.mine, normaliseWorkspace(result));
    },
  });
}

export function useCreateInternshipCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: internshipsService.createCheckIn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INTERNSHIP_QUERY_KEYS.mine });
    },
  });
}

export function useSubmitInternshipPaymentProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: internshipsService.submitPaymentProof,
    onSuccess: (payment: ApiInternshipPayment) => {
      qc.setQueryData(INTERNSHIP_QUERY_KEYS.payment, payment);
      qc.invalidateQueries({ queryKey: INTERNSHIP_QUERY_KEYS.mine });
    },
  });
}