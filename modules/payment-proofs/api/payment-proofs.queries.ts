"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentProofsService } from "./payment-proofs.service";
import type { MyInstallmentPlanUi, MyPaymentProofUi, MyPaymentSurfaceUi, PlanTrancheUi } from "../types";
import type {
  MyInstallmentPlan,
  MyPaymentProof,
  MyPaymentSurface,
  PlanTranche,
} from "../types/api.types";

export const PAYMENT_PROOFS_QUERY_KEYS = {
  mine: ["payment-proofs", "mine"] as const,
  myPlans: ["payment-proofs", "my-plans"] as const,
};

const toDate = (s?: string): Date | undefined =>
  s ? new Date(s) : undefined;

const mapTranche = (t: PlanTranche): PlanTrancheUi => ({
  ...t,
  dueDate: new Date(t.dueDate),
  paidAt: toDate(t.paidAt),
  graceEndsAt: toDate(t.graceEndsAt),
});

const mapPlan = (p: MyInstallmentPlan): MyInstallmentPlanUi => ({
  ...p,
  nextDue: p.nextDue ? mapTranche(p.nextDue) : undefined,
  installments: (p.installments || []).map(mapTranche),
});

const mapProof = (p: MyPaymentProof): MyPaymentProofUi => ({
  ...p,
  createdAt: toDate(p.createdAt),
  reviewedAt: toDate(p.reviewedAt),
});

const mapSurface = (s: MyPaymentSurface): MyPaymentSurfaceUi => ({
  ...s,
  proofs: (s.proofs || []).map(mapProof),
});

export function useMyPaymentSurface() {
  return useQuery<MyPaymentSurfaceUi>({
    queryKey: PAYMENT_PROOFS_QUERY_KEYS.mine,
    queryFn: async () => mapSurface(await paymentProofsService.getMine()),
  });
}

export function useMyInstallmentPlans() {
  return useQuery<MyInstallmentPlanUi[]>({
    queryKey: PAYMENT_PROOFS_QUERY_KEYS.myPlans,
    queryFn: async () =>
      (await paymentProofsService.getMyPlans()).map(mapPlan),
  });
}

export function useSubmitPaymentProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      file: File;
      amount: number;
      registration?: string;
      reference?: string;
      installment?: string;
    }) => paymentProofsService.submitProof(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAYMENT_PROOFS_QUERY_KEYS.mine });
      // The schedule changes the moment an admin confirms, but refetch
      // now anyway so the tranche shows as awaiting review.
      qc.invalidateQueries({ queryKey: PAYMENT_PROOFS_QUERY_KEYS.myPlans });
    },
  });
}
