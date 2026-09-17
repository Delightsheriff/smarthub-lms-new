"use client";

import { useEffect, useState } from "react";

/**
 * Returns a debounced version of `value` that only updates after
 * `delayMs` milliseconds of inactivity.
 *
 * Useful for text inputs feeding network queries (command palette search,
 * server-side job search) to avoid firing a request on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
