import { apiClient } from "@/lib/api";
import { PROFILE_ENDPOINTS } from "../config/endpoints";
import type {
  BankingDetails,
  BankingDetailsPatch,
  ProfileDetailsPatch,
  ProfessionalProfilePatch,
} from "../types";

class ProfileService {
  updateDetails(patch: ProfileDetailsPatch): Promise<{ ok: true }> {
    return apiClient.patch<{ ok: true }>(PROFILE_ENDPOINTS.UPDATE_DETAILS, patch);
  }

  updateProfessional(patch: ProfessionalProfilePatch): Promise<{ ok: true }> {
    return apiClient.patch<{ ok: true }>(
      PROFILE_ENDPOINTS.UPDATE_PROFESSIONAL,
      patch,
    );
  }

  async getBanking(): Promise<BankingDetails> {
    return apiClient.get<BankingDetails | null>(PROFILE_ENDPOINTS.BANKING).then(
      (r) => r ?? {},
    );
  }

  async updateBanking(patch: BankingDetailsPatch): Promise<BankingDetails> {
    return apiClient.patch<BankingDetails>(PROFILE_ENDPOINTS.BANKING, patch);
  }
}

export const profileService = new ProfileService();
