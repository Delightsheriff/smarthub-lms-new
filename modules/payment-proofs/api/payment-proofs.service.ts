import { apiClient, uploadFile } from "@/lib/api";
import { PAYMENT_PROOFS_ENDPOINTS } from "../config/endpoints";
import type {
  MyInstallmentPlan,
  MyPaymentProof,
  MyPaymentSurface,
} from "../types/api.types";

class PaymentProofsService {
  /** Bank details + payable registrations + the learner's proofs. */
  async getMine(): Promise<MyPaymentSurface> {
    return apiClient.get<MyPaymentSurface>(PAYMENT_PROOFS_ENDPOINTS.MINE);
  }

  /** The learner's tranche schedules. Separate call from `getMine` so
   *  the schedule card can paint before the (heavier) bank + history
   *  payload arrives. */
  async getMyPlans(): Promise<MyInstallmentPlan[]> {
    return apiClient.get<MyInstallmentPlan[]>(
      PAYMENT_PROOFS_ENDPOINTS.MY_PLANS,
    );
  }

  /** Upload the receipt via the storage seam, then post the proof. */
  async submitProof(input: {
    file: File;
    amount: number;
    registration?: string;
    reference?: string;
    /** The tranche the learner is paying. A hint for the admin — the
     *  server still settles oldest-first. */
    installment?: string;
  }): Promise<MyPaymentProof> {
    const url = await uploadFile(input.file);
    if (!url) {
      throw new Error("Upload succeeded but no URL was returned");
    }
    return apiClient.post<MyPaymentProof>(PAYMENT_PROOFS_ENDPOINTS.BASE, {
      amount: input.amount,
      screenshotUrl: url,
      registration: input.registration || undefined,
      installment: input.installment || undefined,
      reference: input.reference?.trim() || undefined,
    });
  }
}

export const paymentProofsService = new PaymentProofsService();
