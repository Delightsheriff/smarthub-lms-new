import { apiClient } from "@/lib/api";
import { SIWES_PROFILE_ENDPOINTS } from "../config/endpoints";
import type { ApiSiwesRegistration } from "../types/api.types";
import type { SiwesRegistration } from "../types";
import { normaliseSiwesRegistration } from "./normalise";

class SiwesProfileService {
  async listMySiwesRegistrations(): Promise<SiwesRegistration[]> {
    const rows = await apiClient.get<ApiSiwesRegistration[]>(
      SIWES_PROFILE_ENDPOINTS.MY_SIWES_REGISTRATIONS,
    );
    return (rows || []).map(normaliseSiwesRegistration);
  }
}

export const siwesProfileService = new SiwesProfileService();