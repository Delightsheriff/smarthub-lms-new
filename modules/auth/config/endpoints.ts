import { LMS_PREFIX } from "@/lib/api/constants";

export const AUTH_ENDPOINTS = {
  LOGIN: `${LMS_PREFIX}/auth/login`,
  LOGOUT: `${LMS_PREFIX}/auth/logout`,
  ME: `${LMS_PREFIX}/auth/me`,
  FORGOT_PASSWORD: `${LMS_PREFIX}/auth/forgot-password`,
  RESET_PASSWORD: `${LMS_PREFIX}/auth/reset-password`,
  CHANGE_PASSWORD: `${LMS_PREFIX}/auth/change-password`,
  VERIFY_INVITATION: (token: string) => `${LMS_PREFIX}/invitations/verify/${token}`,
  ACCEPT_INVITATION: `${LMS_PREFIX}/invitations/accept`,
} as const;