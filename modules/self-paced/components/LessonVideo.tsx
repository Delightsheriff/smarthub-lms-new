"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, FileText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { classifyVideoUrl } from "@/modules/learning/utils/video-source";
import type { LessonPlayback } from "../types";

interface Props {
  title: string;
  playback: LessonPlayback;
  /** Fetch a fresh playback reference (new stream token). */
  refresh: () => Promise<LessonPlayback | undefined>;
  onEnded?: () => void;
}

const FRAME = "relative aspect-video w-full overflow-hidden rounded-2xl bg-black";

/**
 * Renders a lesson's video for whichever source it has. Key it by lesson
 * id: it owns per-lesson playback state.
 */
export function LessonVideo({ title, playback, refresh, onEnded }: Props) {
  if (playback.streamUrl) {
    return (
      <DirectStream
        title={title}
        initial={playback}
        refresh={refresh}
        onEnded={onEnded}
      />
    );
  }

  if (playback.url) {
    const source = classifyVideoUrl(playback.url);
    if (source.kind === "video") {
      return (
        <div className={FRAME}>
          <video
            className="h-full w-full"
            src={source.src}
            controls
            playsInline
            preload="metadata"
            onEnded={onEnded}
          />
        </div>
      );
    }
    if (source.kind !== "external") {
      // Nothing autoplays: a learner on metered data chooses when to
      // start spending it.
      const src = source.src.replace(/([?&])autoplay=1/, "$1autoplay=0");
      return (
        <div className={FRAME}>
          <iframe
            src={src}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      );
    }
    return (
      <Placeholder
        icon={<ExternalLink className="h-6 w-6" />}
        text="This lesson's video plays on another site."
        action={
          <Button
            size="sm"
            variant="secondary"
            render={
              <a href={source.src} target="_blank" rel="noopener noreferrer" />
            }
          >
            Open video
          </Button>
        }
      />
    );
  }

  return (
    <Placeholder
      icon={<FileText className="h-6 w-6" />}
      text="This lesson has no video — read through the notes and resources below."
    />
  );
}

function Placeholder({
  icon,
  text,
  action,
}: {
  icon: React.ReactNode;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl bg-muted p-6 text-center text-muted-foreground">
      {icon}
      <p className="text-sm max-w-sm">{text}</p>
      {action}
    </div>
  );
}

/** Refresh this far ahead of the token's expiry. */
const EXPIRY_MARGIN_MS = 60_000;
const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * A direct file behind a short-lived stream token.
 * Proactively refreshes token before expiry and recovers playback seamlessly.
 */
function DirectStream({
  title,
  initial,
  refresh,
  onEnded,
}: {
  title: string;
  initial: LessonPlayback;
  refresh: Props["refresh"];
  onEnded?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState(initial.streamUrl as string);
  const [tokenGeneration, setTokenGeneration] = useState(0);
  const [failed, setFailed] = useState(false);

  const expiresAtRef = useRef(initial.expiresAt);
  const pendingRef = useRef<string | null>(null);
  const resumeRef = useRef<{ time: number; play: boolean } | null>(null);
  const inflightRef = useRef<Promise<string | null> | null>(null);
  const failuresRef = useRef(0);
  const wantsPlayRef = useRef(false);

  const fetchFresh = useCallback((): Promise<string | null> => {
    if (!inflightRef.current) {
      inflightRef.current = refresh()
        .then((p) => {
          if (!p?.streamUrl) return null;
          expiresAtRef.current = p.expiresAt;
          setTokenGeneration((g) => g + 1);
          return p.streamUrl;
        })
        .catch(() => null)
        .finally(() => {
          inflightRef.current = null;
        });
    }
    return inflightRef.current;
  }, [refresh]);

  const swapTo = useCallback((next: string, at?: number) => {
    const video = videoRef.current;
    resumeRef.current = {
      time: at ?? video?.currentTime ?? 0,
      play: wantsPlayRef.current,
    };
    pendingRef.current = null;
    setSrc(next);
  }, []);

  useEffect(() => {
    const expiresAt = expiresAtRef.current;
    if (!expiresAt) return;
    const delay = Math.max(5_000, expiresAt - Date.now() - EXPIRY_MARGIN_MS);
    const id = window.setTimeout(async () => {
      const next = await fetchFresh();
      if (!next) return;
      const video = videoRef.current;
      if (!video || video.paused || video.ended) swapTo(next);
      else pendingRef.current = next;
    }, delay);
    return () => window.clearTimeout(id);
  }, [tokenGeneration, fetchFresh, swapTo]);

  const recover = async () => {
    const video = videoRef.current;
    const at = resumeRef.current?.time ?? video?.currentTime ?? 0;
    if (failuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
      setFailed(true);
      return;
    }
    failuresRef.current += 1;
    const next = pendingRef.current ?? (await fetchFresh());
    if (next) swapTo(next, at);
    else setFailed(true);
  };

  const retryManually = async () => {
    failuresRef.current = 0;
    setFailed(false);
    const next = await fetchFresh();
    if (next) swapTo(next);
    else setFailed(true);
  };

  return (
    <div className={FRAME}>
      <video
        ref={videoRef}
        className="h-full w-full"
        src={src}
        title={title}
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        onLoadedMetadata={() => {
          const video = videoRef.current;
          const resume = resumeRef.current;
          if (!video || !resume) return;
          resumeRef.current = null;
          if (resume.time > 0) video.currentTime = resume.time;
          if (resume.play) void video.play().catch(() => undefined);
        }}
        onPlay={() => {
          wantsPlayRef.current = true;
        }}
        onPlaying={() => {
          failuresRef.current = 0;
          setFailed(false);
        }}
        onPause={() => {
          const video = videoRef.current;
          // A pause right before `ended` isn't the learner pausing.
          if (!video?.ended) wantsPlayRef.current = false;
          if (pendingRef.current && video && !video.ended) {
            swapTo(pendingRef.current);
          }
        }}
        onSeeking={() => {
          const video = videoRef.current;
          if (pendingRef.current && video) {
            swapTo(pendingRef.current, video.currentTime);
          }
        }}
        onError={() => void recover()}
        onEnded={() => {
          wantsPlayRef.current = false;
          onEnded?.();
        }}
      />
      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center text-white">
          <p className="text-sm">Playback was interrupted.</p>
          <Button size="sm" variant="secondary" onClick={() => void retryManually()}>
            <RotateCcw className="h-4 w-4" />
            Reload video
          </Button>
        </div>
      )}
    </div>
  );
}
