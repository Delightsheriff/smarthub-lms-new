"use client";
import { useEffect, useRef } from "react";

/**
 * The certificate is generated asynchronously after the last lesson is
 * ticked, so the course payload that reports completion usually doesn't
 * carry it yet. While `waiting`, refetch on an interval for a bounded
 * window, then stop — a certificate that's slower than that shows up on
 * the next visit instead of polling forever.
 */
export function useCertificateRefetch(
  waiting: boolean,
  refetch: () => unknown,
  intervalMs = 4_000,
  maxAttempts = 15
) {
  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  });

  useEffect(() => {
    if (!waiting) return;
    let attempts = 0;
    const id = window.setInterval(() => {
      attempts += 1;
      void refetchRef.current();
      if (attempts >= maxAttempts) window.clearInterval(id);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [waiting, intervalMs, maxAttempts]);
}
