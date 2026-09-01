"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { authService } from "./auth.service";
import { useAuthStore, toAuthUser } from "@/store/slices/authStore";
import type {
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  AcceptInvitationPayload,
} from "../types";

export const AUTH_QUERY_KEYS = {
  me: ["auth", "me"] as const,
  invitation: (token: string) => ["auth", "invitation", token] as const,
} as const;

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: (res) => {
      const authUser = toAuthUser(res.user);
      setAuth(authUser, res.accessToken);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
    },
    onError: () => {
      logout();
    },
  });
}

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me,
    enabled: isAuthenticated,
    queryFn: async () => {
      const raw = await authService.getMe();
      const user = toAuthUser(raw);
      setUser(user);
      return user;
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequest) => authService.forgotPassword(payload),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordRequest) => authService.resetPassword(payload),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => authService.changePassword(payload),
  });
}

export function useVerifyInvitation(token: string) {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.invitation(token),
    enabled: !!token,
    queryFn: () => authService.verifyInvitation(token),
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (payload: AcceptInvitationPayload) => authService.acceptInvitation(payload),
  });
}