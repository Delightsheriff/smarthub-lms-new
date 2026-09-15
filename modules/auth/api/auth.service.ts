import { apiClient } from "@/lib/api";
import { AUTH_ENDPOINTS } from "../config/endpoints";
import type {
  AuthUser,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyInvitationResponse,
  AcceptInvitationPayload,
} from "../types";

class AuthService {
  // login/logout go through NextAuth now (auth.ts calls the real
  // /auth/login server-side; signOut() clears the session cookie) —
  // see modules/auth/api/auth.queries.ts's useLogin/useLogout.

  async getMe(): Promise<AuthUser> {
    return apiClient.get<AuthUser>(AUTH_ENDPOINTS.ME, { silent: true });
  }

  async forgotPassword(payload: ForgotPasswordRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.post<{ success: boolean; message?: string }>(AUTH_ENDPOINTS.FORGOT_PASSWORD, payload);
  }

  async resetPassword(payload: ResetPasswordRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.post<{ success: boolean; message?: string }>(AUTH_ENDPOINTS.RESET_PASSWORD, payload);
  }

  async changePassword(payload: ChangePasswordRequest): Promise<{ success: boolean; message?: string }> {
    return apiClient.post<{ success: boolean; message?: string }>(AUTH_ENDPOINTS.CHANGE_PASSWORD, payload);
  }

  async verifyInvitation(token: string): Promise<VerifyInvitationResponse> {
    return apiClient.get<VerifyInvitationResponse>(AUTH_ENDPOINTS.VERIFY_INVITATION(token));
  }

  async acceptInvitation(payload: AcceptInvitationPayload): Promise<{ success: boolean; accessToken?: string }> {
    return apiClient.post<{ success: boolean; accessToken?: string }>(AUTH_ENDPOINTS.ACCEPT_INVITATION, payload);
  }
}

export const authService = new AuthService();