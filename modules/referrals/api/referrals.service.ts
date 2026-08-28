import { apiClient } from "@/lib/api";
import { REFERRALS_ENDPOINTS } from "../config/endpoints";
import type {
  AccountMe,
  ApplicationsResponse,
  BankingDetails,
  BankingDetailsPatch,
  Payout,
  PayoutsListResponse,
  ReferralsResponse,
  SetPasswordPayload,
} from "../types";

/**
 * Thin wrapper around the `/account/*` surface. Reads get me,
 * referrals, applications and banking — all that the dashboard needs.
 */
class ReferralsService {
  async getMe(): Promise<AccountMe> {
    return apiClient.get<AccountMe>(REFERRALS_ENDPOINTS.ME);
  }

  async getReferrals(): Promise<ReferralsResponse> {
    return apiClient.get<ReferralsResponse>(REFERRALS_ENDPOINTS.REFERRALS);
  }

  async getApplications(): Promise<ApplicationsResponse> {
    return apiClient.get<ApplicationsResponse>(
      REFERRALS_ENDPOINTS.APPLICATIONS,
    );
  }

  async getBanking(): Promise<BankingDetails> {
    return apiClient.get<BankingDetails | null>(
      REFERRALS_ENDPOINTS.BANKING,
    ).then((r) => r ?? {});
  }

  async updateBanking(patch: BankingDetailsPatch): Promise<BankingDetails> {
    return apiClient.put<BankingDetails>(
      REFERRALS_ENDPOINTS.BANKING,
      patch,
    ).then((r) => r ?? {});
  }

  async setPassword(payload: SetPasswordPayload): Promise<{ ok: true }> {
    return apiClient.post<{ ok: true }>(
      REFERRALS_ENDPOINTS.SET_PASSWORD,
      payload,
    );
  }

  async requestPayout(): Promise<Payout> {
    return apiClient.post<Payout>(REFERRALS_ENDPOINTS.PAYOUTS);
  }

  async getPayouts(
    page = 1,
    pageSize = 20,
  ): Promise<PayoutsListResponse> {
    return apiClient.get<PayoutsListResponse>(REFERRALS_ENDPOINTS.PAYOUTS, {
      params: { page, pageSize },
    });
  }

  async cancelPayout(id: string): Promise<void> {
    await apiClient.delete(REFERRALS_ENDPOINTS.PAYOUT_CANCEL(id));
  }
}

export const referralsService = new ReferralsService();
