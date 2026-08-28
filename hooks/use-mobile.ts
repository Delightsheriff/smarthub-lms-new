import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

const mql =
  typeof window !== "undefined"
    ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    : null;

function subscribe(callback: () => void) {
  mql?.addEventListener("change", callback);
  return () => mql?.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * True on small screens (below 768px). Uses `useSyncExternalStore` over
 * a desktop-first server snapshot so the shell hydrates the desktop
 * rail without a mount-flag flash, and matches the shadcn sidebar
 * breakpoint without calling setState directly inside an effect.
 */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
