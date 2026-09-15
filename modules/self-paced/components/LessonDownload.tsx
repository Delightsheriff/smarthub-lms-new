"use client";
import { AlertCircle, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  startDownload,
  useLessonDownload,
} from "../hooks/use-lesson-download";

/**
 * Offline copy of one lesson, watermarked with the learner's name.
 * Mount with `key={lessonId}` so a lesson change resets the state.
 * Renders nothing once the API has said downloads are switched off.
 */
export function LessonDownload({ lessonId }: { lessonId: string }) {
  const { status, request } = useLessonDownload(lessonId);
  if (status.phase === "disabled") return null;

  const busy = status.phase === "requesting" || status.phase === "processing";

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Watch offline</p>
          <div className="text-xs text-muted-foreground mt-0.5">
            <StatusLine status={status} />
          </div>
        </div>
        <div className="shrink-0">
          {status.phase === "ready" ? (
            <Button size="sm" variant="outline" onClick={() => startDownload(status.url)}>
              <Download className="h-4 w-4" />
              Download again
            </Button>
          ) : status.phase === "unavailable" ||
            status.phase === "rate-limited" ||
            (status.phase === "failed" && !status.retryable) ? null : (
            <Button size="sm" variant="outline" onClick={request} disabled={busy}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {busy
                ? "Preparing…"
                : status.phase === "idle"
                  ? "Download lesson"
                  : "Try again"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function StatusLine({
  status,
}: {
  status: ReturnType<typeof useLessonDownload>["status"];
}) {
  switch (status.phase) {
    case "idle":
      return <>Save this lesson&apos;s video to watch without a connection. Your copy carries your name.</>;
    case "requesting":
      return <>Checking for your copy…</>;
    case "processing":
      return <>Preparing your copy. This can take a few minutes — keep this page open and it will start on its own.</>;
    case "slow":
      return <>Your copy is still being prepared. Try again in a few minutes.</>;
    case "ready":
      return (
        <>
          Your download has started.{" "}
          {status.remainingToday === 0
            ? "That was your last download for today."
            : `${status.remainingToday} ${status.remainingToday === 1 ? "download" : "downloads"} left today.`}
        </>
      );
    case "failed":
      return (
        <Warn>
          {status.retryable
            ? "We couldn't prepare your copy. Please try again."
            : "We couldn't prepare a download for this lesson."}
        </Warn>
      );
    case "rate-limited":
      return <Warn>{status.message}</Warn>;
    case "unavailable":
      return <>This lesson isn&apos;t available to download.</>;
    case "error":
      return <Warn>Something went wrong requesting your download.</Warn>;
    default:
      return null;
  }
}

const Warn = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-start gap-1 text-destructive">
    <AlertCircle className="h-3.5 w-3.5 mt-px shrink-0" />
    {children}
  </span>
);
