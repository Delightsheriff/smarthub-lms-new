import { apiClient } from "@/lib/api";
import { ACCEPTANCE_LETTERS_ENDPOINTS } from "../config/endpoints";
import type { ApiAcceptanceLetter } from "../types/api.types";

class AcceptanceLettersService {
  async list(): Promise<ApiAcceptanceLetter[]> {
    const rows = await apiClient.get<ApiAcceptanceLetter[]>(
      ACCEPTANCE_LETTERS_ENDPOINTS.LIST,
    );
    return rows || [];
  }

  // Body key stays `siwesDurationMonths` regardless of what the read
  // shape calls it — that's the contract the API enforces and the
  // server returns 403 when the registration is locked.
  async updateSiwesDuration(
    registrationId: string,
    siwesDurationMonths: number,
  ): Promise<void> {
    await apiClient.patch(
      ACCEPTANCE_LETTERS_ENDPOINTS.UPDATE_SIWES_DURATION(registrationId),
      { siwesDurationMonths },
    );
  }
}

export const acceptanceLettersService = new AcceptanceLettersService();