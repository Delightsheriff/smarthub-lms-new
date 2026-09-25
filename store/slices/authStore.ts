"use client";

import { create } from "zustand";
import type { AuthUser } from "@/types/auth";

// Re-exported for existing importers (modules/auth/api/auth.queries.ts).
// The implementation lives in lib/auth/to-auth-user.ts — a plain module
// with no "use client" — because auth.ts also needs to call it
// server-side, and a function imported from a "use client" file becomes
// an opaque client reference across that boundary (calling it throws).
export { toAuthUser } from "@/lib/auth/to-auth-user";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken?: string) => void;
  setUser: (user: AuthUser) => void;
  clearMirror: () => void;
}

/**
 * No `persist` middleware here on purpose. NextAuth's httpOnly session
 * cookie is the actual, durable source of truth now (see auth.ts) —
 * this store is a pure in-memory mirror of it, re-populated every load
 * by `AuthSessionBridge`. The store mirrors the session; it is not the
 * source of truth. Calling clearMirror clears the in-memory mirror, but
 * terminating the actual session requires signOut().
 */
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) =>
    set({
      user,
      token: token ?? null,
      isAuthenticated: true,
    }),
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearMirror: () => set({ user: null, token: null, isAuthenticated: false }),
}));
