import { apiClient } from "@/lib/api";
import { AUTH_ENDPOINTS } from "../config/endpoints";

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Authenticated password change from /profile (Security tab). The
 * mock verifies nothing yet and always succeeds; the real service
 * rejects with a 401 when `currentPassword` is wrong, which the form
 * surfaces inline.
 */
class AuthService {
  async changePassword(input: ChangePasswordRequest): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.SET_PASSWORD, input);
  }
}

export const authService = new AuthService();