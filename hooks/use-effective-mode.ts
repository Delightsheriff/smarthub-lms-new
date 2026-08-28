"use client";
import {
  type LmsMode,
  useRoleModeStore,
} from "@/store/slices/roleModeStore";
import { useAuthStore } from "@/store/slices/authStore";

interface EffectiveMode {
  /** The mode the user is actually operating in right now. For dual-
   *  role users this is whatever they last picked; for single-role
   *  users this is pinned to their only mode. */
  mode: LmsMode;
  /** Whether the side rail should render the toggle. Only true for
   *  `lmsRole === 'both'` users. */
  canSwitch: boolean;
  /** Pass-through setter that's a no-op when `canSwitch` is false —
   *  components don't need to gate calls. */
  setMode: (m: LmsMode) => void;
}

/**
 * Reconciles the user's `lmsRole` (source of truth for what they *can*
 * do — from the auth store during the UI-first/mock phase) with the
 * persisted `roleMode` slice (what they last picked). Single-role users
 * always see the mode their role pins them to; dual-role users see
 * whatever they chose, defaulting to `student` on first load.
 */
export function useEffectiveMode(): EffectiveMode {
  const user = useAuthStore((s) => s.user);
  const storedMode = useRoleModeStore((s) => s.mode);
  const setStoredMode = useRoleModeStore((s) => s.setMode);

  const lmsRole = user?.lmsRole;

  if (lmsRole === "instructor") {
    return { mode: "instructor", canSwitch: false, setMode: () => {} };
  }
  if (lmsRole === "student") {
    return { mode: "student", canSwitch: false, setMode: () => {} };
  }
  if (lmsRole === "both") {
    return {
      mode: storedMode,
      canSwitch: true,
      setMode: setStoredMode,
    };
  }
  return { mode: "student", canSwitch: false, setMode: () => {} };
}
