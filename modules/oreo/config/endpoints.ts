/**
 * Oreo endpoints. The ask surface is a hypermedia seam (ADR 0010): the
 * exact transport (one-shot in the mock, SSE later) is behind the
 * service — pages never call these paths directly.
 */
export const OREO_ENDPOINTS = {
  ASK: "/lms/oreo/ask",
  STREAM: "/lms/oreo/ask/stream",
  USAGE: "/lms/oreo/usage",
} as const;