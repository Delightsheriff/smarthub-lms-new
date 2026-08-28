"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LmsMode = "student" | "instructor";

interface RoleModeState {
  /** The mode the user is currently operating in. For single-role
   *  users this is fixed by `useEffectiveMode`; the persisted value
   *  only matters for `'both'` users so the side rail remembers what
   *  they were doing across reloads. */
  mode: LmsMode;
  setMode: (mode: LmsMode) => void;
}

/**
 * Mode is intentionally a stand-alone slice. It's persisted (so dual-
 * role users come back to the same shell they left), but the source
 * of truth for "what can this user actually do" stays on `AuthUser.
 * lmsRole`. The `useEffectiveMode` hook (alongside) reconciles the
 * two and is what every consumer should read.
 */
export const useRoleModeStore = create<RoleModeState>()(
  persist(
    (set) => ({
      mode: "student",
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "smarthub-lms-new.role-mode.v1",
    }
  )
);
