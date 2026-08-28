"use client";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True only after the client has hydrated. On the server (and the very
 * first client render) it is `false`; after hydration React swaps in the
 * client snapshot and it becomes `true`.
 *
 * Idiomatic replacement for the `useEffect(() => setMounted(true))`
 * pattern — satisfies this repo's `react-hooks/set-state-in-effect`
 * rule and gives components (e.g. theme toggles) a safe "hydrated"
 * signal to avoid SSR/hydration mismatches.
 */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
