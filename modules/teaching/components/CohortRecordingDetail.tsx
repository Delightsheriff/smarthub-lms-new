"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Link2, Loader2, Pencil, Trash2, Unlink } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichText } from "@/components/ui/rich-text";
import { cn } from "@/lib/utils";
import { classifyVideoUrl } from "@/modules/learning/utils/video-source";
import {
  useAttachRecordingToSchedule,
  useCohortRecordings,
  useDeleteTeachingContent,
  useDetachFromSchedule,
  useTeachingRecording,
} from "../api/teaching.queries";
import {
  AuthoringLoadError,
  AuthoringShell,
  AuthoringSkeleton,
  ConfirmDialog,
  errorText,
} from "./authoring/authoring-kit";

/**
 * Instructor view of one recording: the player (same URL classifier as
 * the student dialog), its parts, whether THIS cohort can see it, and
 * Edit / Delete. Attach vs detach follows the row's real state — never
 * offer to undo an attachment that doesn't exist (legacy c94bf39).
 */
export function CohortRecordingDetail({
  scheduleId,
  recordingId,
}: {
  scheduleId: string;
  recordingId: string;
}) {
  const router = useRouter();
  const recording = useTeachingRecording(recordingId);
  const cohortRecordings = useCohortRecordings(scheduleId);
  const attach = useAttachRecordingToSchedule(scheduleId);
  const detach = useDetachFromSchedule(scheduleId);
  const del = useDeleteTeachingContent();
  const [partIndex, setPartIndex] = useState(0);
  const [confirm, setConfirm] = useState<"delete" | "detach" | null>(null);
  const cohortHref = `/teach/cohorts/${scheduleId}?tab=modules`;

  if (recording.isLoading) return <AuthoringSkeleton />;
  if (recording.isError || !recording.data) {
    return (
      <AuthoringLoadError
        message="Couldn't load this recording."
        backHref={cohortHref}
        onRetry={() => recording.refetch()}
      />
    );
  }

  const r = recording.data;
  const parts = r.links?.length
    ? r.links
    : r.videoUrl
      ? [{ name: "Recording", url: r.videoUrl }]
      : [];
  const current = parts[Math.min(partIndex, parts.length - 1)];
  const source = current ? classifyVideoUrl(current.url) : null;

  const attachment = cohortRecordings.data?.find((row) => row.recordingId === recordingId);
  const isAttached = !!attachment && attachment.isVisible;

  const onAttach = async () => {
    try {
      await attach.mutateAsync(recordingId);
      toast.success("Shared with this cohort");
    } catch (err) {
      toast.error(errorText(err, "Couldn't share it with this cohort."));
    }
  };

  const onDetach = async () => {
    try {
      await detach.mutateAsync({ kind: "recording", id: recordingId });
      toast.success("Hidden from this cohort");
      setConfirm(null);
    } catch (err) {
      toast.error(errorText(err, "Couldn't hide it from this cohort."));
    }
  };

  const onDelete = async () => {
    try {
      await del.mutateAsync({ kind: "recording", id: recordingId });
      toast.success("Recording deleted");
      router.replace(cohortHref);
    } catch (err) {
      toast.error(errorText(err, "Couldn't delete the recording."));
    }
  };

  return (
    <AuthoringShell
      backHref={cohortHref}
      backLabel="Back to cohort"
      title={r.title}
      description={
        <span className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">
            {r.recordingType === "passedClass" ? "Past class" : "Module recording"}
          </Badge>
          {typeof r.duration === "number" && r.duration > 0 && (
            <Badge variant="outline" className="font-mono">
              {Math.round(r.duration / 60)} min
            </Badge>
          )}
          {cohortRecordings.isSuccess && (
            <Badge variant={isAttached ? "success" : "outline"}>
              {isAttached ? "Shared with this cohort" : "Not shared with this cohort"}
            </Badge>
          )}
        </span>
      }
    >
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href={`/teach/cohorts/${scheduleId}/recordings/${recordingId}/edit`} />
          }
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          Edit
        </Button>
        {cohortRecordings.isSuccess &&
          (isAttached ? (
            <Button variant="outline" size="sm" onClick={() => setConfirm("detach")}>
              <Unlink className="h-3.5 w-3.5" aria-hidden />
              Hide from this cohort
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onAttach} disabled={attach.isPending}>
              {attach.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Link2 className="h-3.5 w-3.5" aria-hidden />
              )}
              Share with this cohort
            </Button>
          ))}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setConfirm("delete")}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          Delete
        </Button>
      </div>

      <section className="space-y-3 border-t border-border pt-6">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
          {!source ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No video link on this recording.
            </p>
          ) : source.kind === "youtube" || source.kind === "vimeo" || source.kind === "drive" ? (
            <iframe
              key={source.src}
              src={source.src}
              title={r.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : source.kind === "video" ? (
            <video key={source.src} src={source.src} controls className="h-full w-full" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
              <p className="text-sm text-muted-foreground">This link can&apos;t be played inline.</p>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<a href={source.src} target="_blank" rel="noopener noreferrer" />}
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Open in a new tab
              </Button>
            </div>
          )}
        </div>
        {parts.length > 1 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Recording parts">
            {parts.map((p, i) => (
              <Button
                key={`${p.url}-${i}`}
                size="sm"
                variant={i === partIndex ? "default" : "outline"}
                aria-pressed={i === partIndex}
                onClick={() => setPartIndex(i)}
                className={cn(i === partIndex && "pointer-events-none")}
              >
                {p.name || `Part ${i + 1}`}
              </Button>
            ))}
          </div>
        )}
      </section>

      {r.description && (
        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="text-sm font-semibold">Description</h2>
          <RichText html={r.description} />
        </section>
      )}

      <ConfirmDialog
        open={confirm === "detach"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Hide this recording from the cohort?"
        description={
          <>
            Students in this cohort stop seeing <strong>{r.title}</strong>. It stays in
            the module and in other cohorts, and you can share it again any time.
          </>
        }
        confirmLabel="Hide from cohort"
        pending={detach.isPending}
        onConfirm={onDetach}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Delete this recording?"
        description={
          <>
            <strong>{r.title}</strong> is removed from its module in every cohort, not
            just this one. To hide it here only, use &ldquo;Hide from this cohort&rdquo;.
          </>
        }
        confirmLabel="Delete recording"
        pending={del.isPending}
        onConfirm={onDelete}
      />
    </AuthoringShell>
  );
}
