"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn, signOut } from "next-auth/react";
import { toast } from "sonner";
import { authService } from "./auth.service";
import { useAuthStore, toAuthUser } from "@/store/slices/authStore";
import { useRoleModeStore } from "@/store/slices/roleModeStore";
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

/**
 * Signs in through NextAuth's Credentials provider (auth.ts calls the
 * real smarthub-api /auth/login server-side). `AuthSessionBridge`
 * mirrors the resulting session into the Zustand store once it lands —
 * this mutation doesn't call `setAuth` itself, only surfaces success/
 * failure to the form. `redirect: false` keeps NextAuth from doing its
 * own navigation; `LoginPageContent` already does that with `nextPath`.
 */
export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const result = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });
      if (!result || result.error) {
        throw new Error(
          result?.error === "CredentialsSignin"
            ? "Invalid email or password"
            : "Sign in failed. Please try again.",
        );
      }
      return result;
    },
    onError: (error) => {
      // signIn() doesn't go through apiClient, so there's no automatic
      // toast for it the way every other mutation gets one.
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => signOut({ redirect: false }),
  });
}

export function useAppLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const clearMirror = useAuthStore((s) => s.clearMirror);

  return useCallback(async () => {
    try {
      await logout.mutateAsync();
    } catch {
      // Ignore network errors so local session and cache are always cleared
    }
    clearMirror();
    queryClient.clear();
    useRoleModeStore.getState().setMode("student");
    router.replace("/login");
  }, [clearMirror, logout, queryClient, router]);
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