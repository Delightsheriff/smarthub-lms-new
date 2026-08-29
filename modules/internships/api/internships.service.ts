import { apiClient, uploadFile } from "@/lib/api";
import {
  INTERNSHIP_CHECK_INS_PATH,
  INTERNSHIP_ENDPOINTS,
  internshipTaskPath,
} from "../config/endpoints";
import type {
  ApiCreateCheckInInput,
  ApiInternship,
  ApiInternshipCheckIn,
  ApiInternshipPayment,
  ApiSubmitPaymentProofInput,
} from "../types/api.types";

class InternshipsService {
  /** The intern's workspace. Null when there's no placement. */
  async getMine(): Promise<ApiInternship | null> {
    return apiClient.get<ApiInternship | null>(INTERNSHIP_ENDPOINTS.ME);
  }

  /** Progress a task to `in_progress`/`submitted`. Returns the whole
   *  workspace so the client refreshes in one shot. */
  async updateTask(
    taskId: string,
    input: { status: "in_progress" | "submitted"; submissionUrl?: string; submissionNote?: string },
  ): Promise<ApiInternship> {
    return apiClient.patch<ApiInternship>(internshipTaskPath(taskId), {
      status: input.status,
      submissionUrl: input.submissionUrl?.trim() || undefined,
      submissionNote: input.submissionNote?.trim() || undefined,
    });
  }

  /** Post a weekly check-in. */
  async createCheckIn(input: ApiCreateCheckInInput): Promise<ApiInternshipCheckIn> {
    return apiClient.post<ApiInternshipCheckIn>(INTERNSHIP_CHECK_INS_PATH, input);
  }

  /** The intern's payment surface (fee, bank, proof state). */
  async getMyPayment(): Promise<ApiInternshipPayment | null> {
    return apiClient.get<ApiInternshipPayment | null>(
      INTERNSHIP_ENDPOINTS.PAYMENT,
    );
  }

  /** Upload the receipt via the storage seam, then record it. */
  async submitPaymentProof(input: {
    file: File;
    reference?: string;
  }): Promise<ApiInternshipPayment> {
    const proofUrl = await uploadFile(input.file);
    if (!proofUrl) {
      throw new Error("Upload succeeded but no URL was returned");
    }
    const payload: ApiSubmitPaymentProofInput = {
      proofUrl,
      reference: input.reference?.trim() || undefined,
    };
    return apiClient.post<ApiInternshipPayment>(
      INTERNSHIP_ENDPOINTS.PAYMENT_PROOF,
      payload,
    );
  }
}

export const internshipsService = new InternshipsService();