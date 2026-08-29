"use client";
import { useMutation } from "@tanstack/react-query";
import { authService, type ChangePasswordRequest } from "./auth.service";

/**
 * Authenticated password change — the form on the profile Security
 * tab. The server verifies `currentPassword`; a 401 from the API
 * means it was wrong, surfaced inline rather than as a toast.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordRequest) =>
      authService.changePassword(input),
  });
}