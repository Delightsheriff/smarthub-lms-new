"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { selfPacedService } from "../api/self-paced.service";
import { toApiUrl } from "../api/normalise";
import { apiErrorCode } from "../lib/access-denial";

export type LessonDownloadStatus =
  | { phase: "idle" }
  | { phase: "requesting" }
  | { phase: "processing"; polls: number }
  /** The encode is taking longer than we're willing to poll for. */
  | { phase: "slow" }
  | { phase: "ready"; url: string; expiresAt: number; remainingToday: number }
  | { phase: "failed"; retryable: boolean }
  | { phase: "rate-limited"; message: string }
  | { phase: "unavailable" }
  | { phase: "disabled" }
  | { phase: "error" };

/** ~10 minutes at the API's 30s hint. */
const MAX_POLLS = 20;
const clampSeconds = (s: number) => Math.min(Math.max(s || 30, 5), 120);

// Per-session memory, so a refusal that won't change on a retry isn't
// offered again on every lesson visit. A reload clears it.
let downloadsDisabled = false;
const unavailableLessons = new Set<string>();

/**
 * Request → (poll while processing) → ready, for one lesson.
 *
 * Only a READY answer spends one of the learner's daily links, so
 * polling is free; a ready link is reused until it lapses rather than
 * re-requested. The encode runs server-side, so leaving the page just
 * stops the polling — coming back picks the ready copy up at once.
 */
export function useLessonDownload(lessonId: string) {
  const [status, setStatus] = useState<LessonDownloadStatus>(() =>
    downloadsDisabled
      ? { phase: "disabled" }
      : unavailableLessons.has(lessonId)
        ? { phase: "unavailable" }
        : { phase: "idle" }
  );
  const timer = useRef<number | undefined>(undefined);
  const mounted = useRef(true);
  const requestRef = useRef<(polls?: number) => Promise<void>>(undefined);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      window.clearTimeout(timer.current);
    };
  }, []);

  const request = useCallback(
    async (polls = 0): Promise<void> => {
      window.clearTimeout(timer.current);
      if (polls === 0) setStatus({ phase: "requesting" });
      try {
        const r = await selfPacedService.requestDownload(lessonId);
        if (!mounted.current) return;
        if (r.state === "ready") {
          const expires = new Date(r.expiresAt).getTime();
          const url = toApiUrl(r.downloadPath);
          setStatus({
            phase: "ready",
            url,
            expiresAt: Number.isFinite(expires) ? expires : Date.now() + 10 * 60_000,
            remainingToday: Math.max(0, r.remainingToday),
          });
          startDownload(url);
        } else if (r.state === "processing") {
          if (polls >= MAX_POLLS) {
            setStatus({ phase: "slow" });
            return;
          }
          setStatus({ phase: "processing", polls });
          timer.current = window.setTimeout(
            () => void requestRef.current?.(polls + 1),
            clampSeconds(r.retryAfterSeconds) * 1000
          );
        } else {
          setStatus({ phase: "failed", retryable: r.retryable });
        }
      } catch (error) {
        if (!mounted.current) return;
        const code = apiErrorCode(error);
        if (code === "DOWNLOADS_DISABLED") {
          downloadsDisabled = true;
          setStatus({ phase: "disabled" });
        } else if (code === "DOWNLOAD_UNAVAILABLE") {
          unavailableLessons.add(lessonId);
          setStatus({ phase: "unavailable" });
        } else if (code === "DOWNLOAD_RATE_LIMITED") {
          setStatus({
            phase: "rate-limited",
            message:
              error instanceof Error && error.message
                ? error.message
                : "You've reached today's download limit. Try again tomorrow.",
          });
        } else {
          setStatus({ phase: "error" });
        }
      }
    },
    [lessonId]
  );

  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  // A ready link lapses; fall back to a fresh request after that.
  useEffect(() => {
    if (status.phase !== "ready") return;
    const ms = Math.max(0, status.expiresAt - Date.now());
    const id = window.setTimeout(() => setStatus({ phase: "idle" }), ms);
    return () => window.clearTimeout(id);
  }, [status]);

  return { status, request: () => void request(0) };
}

/**
 * The API answers the tokenised path with a redirect to an attachment
 * URL, so following it in place saves the file without leaving the
 * page. A plain navigation rather than `window.open`: this can fire
 * from a poll, long after the click, where a popup would be blocked.
 */
export function startDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
