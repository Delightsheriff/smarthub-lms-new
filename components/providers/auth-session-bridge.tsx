"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/store/slices/authStore";

/**
 * Mirrors NextAuth's session into the Zustand `authStore` so every
 * existing consumer (17 call sites — the sidebar, top bar, socket
 * provider, profile, the axios interceptor's `getState()` read outside
 * React, ...) keeps working against the same store shape unchanged.
 * NextAuth's httpOnly-cookie session is the actual source of truth now;
 * this component is the one place that keeps the two in sync.
 *
 * Deliberately renders nothing — it's a side-effect-only bridge, not
 * UI. Mount once, high in the tree (AppProviders).
 */
export function AuthSessionBridge() {
  const { data: session, status } = useSession();
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setAuth(session.user, session.accessToken);
    } else if (status === "unauthenticated") {
      logout();
    }
    // "loading" — leave the store as-is; nothing to sync yet.
  }, [status, session, setAuth, logout]);

  return null;
}
