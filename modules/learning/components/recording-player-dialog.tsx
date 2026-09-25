"use client";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Film,
  ListVideo,
  Loader2,
  PlayCircle,
  Video,
  VideoOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RichText } from "@/components/ui/rich-text";
import {
  useTrackRecordingView,
  useToggleContentComplete,
} from "@/modules/learning/api/content.queries";
import { classifyVideoUrl } from "@/modules/learning/utils/video-source";
import { cn } from "@/lib/utils";
import type { Recording } from "@/modules/learning/types";

interface RecordingPlayerDialogProps {
  recording: Recording | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId?: string;
  completed?: boolean;
}

/**
 * Modernized cinema video player modal.
 *
 * Features:
 *  - High-fidelity 16:9 cinema frame with ambient glass styling
 *  - Single view ping on dialog open (guarded by ref)
 *  - Completion tracking via progress table with auto-mark at 80% on video and manual toggle
 *  - Segmented playlist pills for multi-part recordings
 *  - External session fallback launcher with rich poster card
 *  - Accessible actions with nativeButton={false} and semantic tokens
 */
export function RecordingPlayerDialog({
  recording,
  open,
  onOpenChange,
  courseId,
  completed = false,
}: RecordingPlayerDialogProps) {
  const trackView = useTrackRecordingView();
  const toggleComplete = useToggleContentComplete(courseId);
  const viewPingedRef = useRef<string | null>(null);
  const autoCompletedRef = useRef<string | null>(null);

  // Which part is playing. Keyed by recording id so a newly-opened
  // recording always starts on its first part without a reset effect.
  const [partState, setPartState] = useState<{ forId: string; index: number }>(
    { forId: "", index: 0 },
  );
  const activePart =
    partState.forId === (recording?.id ?? "") ? partState.index : 0;

  // Single /view ping on dialog open, guarded by ref
  const recordingId = recording?.id;
  const trackViewMutate = trackView.mutate;
  useEffect(() => {
    if (open && recordingId) {
      if (viewPingedRef.current !== recordingId) {
        viewPingedRef.current = recordingId;
        trackViewMutate(recordingId);
      }
    } else {
      viewPingedRef.current = null;
      autoCompletedRef.current = null;
    }
  }, [open, recordingId, trackViewMutate]);

  if (!recording) return null;

  const parts = recording.links.length
    ? recording.links
    : recording.videoUrl
      ? [{ name: "Part 1", url: recording.videoUrl }]
      : [];
  const activeUrl = parts[activePart]?.url ?? recording.videoUrl;
  const source = activeUrl ? classifyVideoUrl(activeUrl) : null;

  const embedUrl =
    source && (source.kind === "youtube" || source.kind === "vimeo" || source.kind === "drive")
      ? source.src
      : null;
  const isDirectVideo = source?.kind === "video";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl lg:max-w-5xl w-full p-0 gap-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-2xl duration-250 ease-[var(--ease-out-strong)]">
        {/* Cinema Header */}
        <DialogHeader className="px-5 py-4 sm:px-6 sm:py-5 border-b border-border/60 bg-muted/20 pr-14 text-left">
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            {completed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success border border-success/20">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                Class Recording
              </span>
            )}
            <span className="text-muted-foreground/40 text-xs" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {recording.durationLabel}
            </span>
          </div>

          <DialogTitle className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug break-words">
            {recording.title}
          </DialogTitle>

          {recording.description && (
            <DialogDescription
              render={<div />}
              className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1 line-clamp-2 max-w-3xl"
            >
              <RichText html={recording.description} />
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Multi-part Playlist Selector */}
        {parts.length > 1 && (
          <div className="px-5 py-2.5 sm:px-6 bg-muted/30 border-b border-border/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
              <ListVideo className="h-3.5 w-3.5 text-accent" />
              Parts ({parts.length}):
            </span>
            <div className="flex items-center gap-1.5">
              {parts.map((part, i) => (
                <button
                  key={`${part.url}-${i}`}
                  type="button"
                  onClick={() => setPartState({ forId: recording.id, index: i })}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-[transform,background-color,color] active:scale-[0.97]",
                    i === activePart
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground border border-border/60",
                  )}
                >
                  <PlayCircle className="h-3 w-3" />
                  {part.name || `Part ${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cinema Video Player Canvas */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {embedUrl ? (
            <iframe
              key={embedUrl}
              src={embedUrl}
              className="h-full w-full border-0"
              title={recording.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : isDirectVideo ? (
            <video
              key={source?.src}
              src={source?.src}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-contain"
              onTimeUpdate={(e) => {
                const el = e.currentTarget;
                if (!el.duration || !isFinite(el.duration)) return;
                // Auto-mark complete via progress POST once at 80%
                if (el.currentTime / el.duration >= 0.8) {
                  if (courseId && !completed && autoCompletedRef.current !== recording.id) {
                    autoCompletedRef.current = recording.id;
                    toggleComplete.mutate({
                      contentType: "recording",
                      contentId: recording.id,
                      completed: false,
                    });
                  }
                }
              }}
            />
          ) : source ? (
            <div className="relative flex flex-col h-full w-full items-center justify-center gap-4 px-6 text-center bg-card text-card-foreground">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-muted/80 border border-border text-accent shadow-lg">
                <Video className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base sm:text-lg font-semibold text-foreground font-display">
                  External Video Session
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  This recording is hosted on an external platform and opens in a new tab.
                </p>
              </div>
              <Button
                size="default"
                nativeButton={false}
                className="mt-1 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md gap-2 active:scale-[0.97] transition-transform"
                render={
                  <a href={source.src} target="_blank" rel="noopener noreferrer" />
                }
              >
                Open video in new tab
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col h-full w-full items-center justify-center gap-2 text-muted-foreground bg-muted/50">
              <VideoOff className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">Video currently unavailable.</p>
            </div>
          )}
        </div>

        {/* Modernized Bottom Action Bar */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            {isDirectVideo && !completed ? (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
                <span>Auto-marks complete at 80% playback</span>
              </span>
            ) : completed ? (
              <span className="flex items-center gap-1.5 text-success font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>You have completed this recording</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-accent shrink-0" />
                <span>{recording.durationLabel}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {source && (
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground active:scale-[0.97] transition-transform rounded-xl"
                render={
                  <a href={source.src} target="_blank" rel="noopener noreferrer" />
                }
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open external
              </Button>
            )}
            {courseId && (
              <Button
                size="sm"
                variant={completed ? "secondary" : "default"}
                disabled={toggleComplete.isPending}
                onClick={() =>
                  toggleComplete.mutate({
                    contentType: "recording",
                    contentId: recording.id,
                    completed,
                  })
                }
                className={cn(
                  "gap-1.5 rounded-xl text-xs font-semibold active:scale-[0.97] transition-all",
                  completed
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
                )}
              >
                {toggleComplete.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
                {completed ? "Completed" : "Mark as complete"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
