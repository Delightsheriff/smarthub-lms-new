"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTrackRecordingView } from "@/modules/learning/api/content.queries";
import { classifyVideoUrl } from "@/modules/learning/utils/video-source";
import type { Recording } from "@/modules/learning/types";

interface RecordingPlayerDialogProps {
  recording: Recording | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Centred modal player. Two side-effects fire while the player is open:
 *  1. On `play` → call the view-tracking mutation once per session.
 *     Mirrors the API's `PATCH /recordings/:id/view` endpoint.
 *  2. On `timeupdate` past 80% playback → flip `watched: true`. The
 *     real API treats 80% as the "completed" threshold; the mock hook
 *     mutates the in-memory record so the outline tick re-renders.
 *
 * A recording can span several videos (Part 1 / Part 2). When it does,
 * the parts appear as pills above the player and the first one plays
 * by default. View-tracking stays per-recording, not per-part — the
 * API counts a view of the session, not of a file.
 */
export function RecordingPlayerDialog({
  recording,
  open,
  onOpenChange,
}: RecordingPlayerDialogProps) {
  const trackView = useTrackRecordingView();
  const trackedThisSessionRef = useRef<string | null>(null);
  // Which part is playing. Keyed by recording id so a newly-opened
  // recording always starts on its first part without a reset effect
  // (the derived value falls back to 0 when `forId` no longer matches).
  const [partState, setPartState] = useState<{ forId: string; index: number }>(
    { forId: "", index: 0 },
  );
  const activePart =
    partState.forId === (recording?.id ?? "") ? partState.index : 0;

  // Reset the per-session tracked-id whenever the dialog closes so a
  // re-open of the same recording fires the ping again.
  useEffect(() => {
    if (!open) trackedThisSessionRef.current = null;
  }, [open]);

  if (!recording) return null;

  const parts = recording.links.length
    ? recording.links
    : recording.videoUrl
      ? [{ name: "Link 1", url: recording.videoUrl }]
      : [];
  const activeUrl = parts[activePart]?.url ?? recording.videoUrl;
  const source = activeUrl ? classifyVideoUrl(activeUrl) : null;
  const trackOnce = () => {
    if (trackedThisSessionRef.current === recording.id) return;
    trackedThisSessionRef.current = recording.id;
    trackView.mutate(recording.id);
  };

  const embedUrl =
    source && (source.kind === "youtube" || source.kind === "vimeo" || source.kind === "drive")
      ? source.src
      : null;
  const isDirectVideo = source?.kind === "video";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-4 md:p-6 gap-3">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            {recording.title}
            {recording.watched && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Watched
              </span>
            )}
          </DialogTitle>
          {recording.description && (
            <DialogDescription>{recording.description}</DialogDescription>
          )}
        </DialogHeader>

        {parts.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {parts.map((part, i) => (
              <Button
                key={`${part.url}-${i}`}
                type="button"
                size="sm"
                variant={i === activePart ? "default" : "secondary"}
                className="rounded-full px-3"
                onClick={() =>
                  setPartState({ forId: recording.id, index: i })
                }
              >
                {part.name || `Link ${i + 1}`}
              </Button>
            ))}
          </div>
        )}

        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          {embedUrl ? (
            <iframe
              key={embedUrl}
              src={embedUrl}
              className="h-full w-full"
              title={recording.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isDirectVideo ? (
            <video
              key={source?.src}
              src={source?.src}
              controls
              className="h-full w-full"
              onPlay={trackOnce}
              onTimeUpdate={(e) => {
                const el = e.currentTarget;
                if (!el.duration || isFinite(el.duration) === false) return;
                // Mark complete at 80% — same threshold the API uses.
                if (el.currentTime / el.duration >= 0.8) {
                  if (!recording.watched) {
                    // Idempotent — the API flips `watched` server-side.
                    trackView.mutate(recording.id);
                  }
                }
              }}
            />
          ) : source ? (
            // External / unknown — can't embed inline. Surface a clear
            // "Open in a new tab" CTA rather than showing a broken
            // iframe.
            <div className="flex flex-col h-full w-full items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm text-white/80">
                This recording is hosted externally and can&apos;t be played
                inline.
              </p>
              <Button
                size="sm"
                onClick={trackOnce}
                render={
                  <a href={source.src} target="_blank" rel="noopener noreferrer" />
                }
              >
                Open in a new tab
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
              Video unavailable.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{recording.durationLabel}</span>
          <div className="flex items-center gap-3">
            {source && (
              <a
                href={source.src}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackOnce()}
                className="inline-flex items-center gap-1 text-foreground hover:text-primary"
              >
                Open in new tab
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <span>Auto-marked complete at 80% playback</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
