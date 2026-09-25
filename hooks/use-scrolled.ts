import { useSyncExternalStore } from "react";

/**
 * True once the window has scrolled past `threshold` px. Read via
 * useSyncExternalStore so it never sets state inside an effect; the
 * server snapshot is "not scrolled" (pages load at the top).
 */
export function useScrolled(threshold = 4): boolean {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("scroll", onChange, { passive: true });
      return () => window.removeEventListener("scroll", onChange);
    },
    () => window.scrollY > threshold,
    () => false,
  );
}
