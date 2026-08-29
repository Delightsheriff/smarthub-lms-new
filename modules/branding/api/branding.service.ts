import { apiClient } from "@/lib/api";
import { BRANDING_ENDPOINTS } from "../config/endpoints";
import type { Branding } from "../types";

class BrandingService {
  /** The tenant's logo suite + social links. */
  async getBranding(): Promise<Branding> {
    return apiClient.get<Branding>(BRANDING_ENDPOINTS.BASE);
  }
}

export const brandingService = new BrandingService();