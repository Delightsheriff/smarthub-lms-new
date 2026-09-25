"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  EyeOff,
  FileText,
  Link2,
  Loader2,
  Plus,
  Search,
  Unlink,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ledger, LedgerControlItem } from "@/components/ui/ledger";
import { Pager, usePagedList } from "@/components/ui/pager";
import { RichText } from "@/components/ui/rich-text";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, pluralize } from "@/lib/utils";
import {
  useMaterialsByModule,
  useRecordingsByModule,
} from "@/modules/learning/api/content.queries";
import {
  useAttachRecordingToSchedule,
  useCohortAssignments,
  useCohortModules,
  useCohortRecordings,
  useDetachFromSchedule,
  useTeachingCohortDetail,
} from "../api/teaching.queries";
import { AttachExistingAssignmentDialog } from "./AttachExistingAssignmentDialog";
import { AttachExistingRecordingDialog } from "./AttachExistingRecordingDialog";
import { ModuleStatusSelect } from "./CohortModulesTab";
import { AuthoringLoadError, ConfirmDialog, errorText } from "./authoring/authoring-kit";

const RECORDINGS_PER_PAGE = 10;

const matches = (q: string, ...fields: (string | undefined)[]) =>
  !q || fields.some((f) => f?.toLowerCase().includes(q));

/**
 * One module as this cohort experiences it: its status, what it's
 * about, and the recordings, materials and assignments — with the
 * controls to add, share, hide and remove them for this cohort.
 */
export function CohortModulePageContent({
  scheduleId,
  moduleSlug,
}: {
  scheduleId: string;
  moduleSlug: string;
}) {
  const cohort = useTeachingCohortDetail(scheduleId);
  const statuses = useCohortModules(scheduleId);
  const mod = cohort.data?.modules.find((m) => (m.slug || m.id) === moduleSlug);
  const moduleId = mod?.id;

  const recordings = useRecordingsByModule(moduleId);
  const materials = useMaterialsByModule(moduleId);
  const assignments = useCohortAssignments(scheduleId);
  const cohortRecordings = useCohortRecordings(scheduleId);
  const attachRecording = useAttachRecordingToSchedule(scheduleId);
  const detach = useDetachFromSchedule(scheduleId);

  const [query, setQuery] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [attachAssignmentOpen, setAttachAssignmentOpen] = useState(false);
  const [pendingShare, setPendingShare] = useState<string | null>(null);
  const [detaching, setDetaching] = useState<{
    kind: "recording" | "assignment";
    id: string;
    title: string;
  } | null>(null);

  const q = query.trim().toLowerCase();
  const base = `/teach/cohorts/${scheduleId}`;

  // Plain derivations — the React compiler memoizes these.
  const sharedIds = new Set(
    (cohortRecordings.data ?? []).filter((r) => r.isVisible).map((r) => r.recordingId),
  );
  const visibleRecordings = (recordings.data ?? []).filter((r) =>
    matches(q, r.title, r.description),
  );
  const recordingPages = usePagedList(visibleRecordings, RECORDINGS_PER_PAGE);
  const visibleMaterials = (materials.data ?? []).filter((m) => matches(q, m.title, m.category));
  const moduleAssignments = (assignments.data ?? []).filter(
    (a) => a.module === moduleId && matches(q, a.title, a.description),
  );

  if (cohort.isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }
  if (cohort.isError || !cohort.data) {
    return (
      <AuthoringLoadError
        message="Couldn't load this cohort."
        backHref="/teach"
        onRetry={() => cohort.refetch()}
      />
    );
  }
  if (!mod) {
    return (
      <AuthoringLoadError
        message="This module isn't part of this cohort's course."
        backHref={`${base}?tab=modules`}
      />
    );
  }

  const status = statuses.data?.find((r) => r.moduleId === mod.id)?.status;

  const share = async (recordingId: string) => {
    setPendingShare(recordingId);
    try {
      await attachRecording.mutateAsync(recordingId);
      toast.success("Shared with this cohort");
    } catch (err) {
      toast.error(errorText(err, "Couldn't share it with this cohort."));
    } finally {
      setPendingShare(null);
    }
  };

  const onDetach = async () => {
    if (!detaching) return;
    try {
      await detach.mutateAsync({ kind: detaching.kind, id: detaching.id });
      toast.success(
        detaching.kind === "recording" ? "Hidden from this cohort" : "Removed from this cohort",
      );
      setDetaching(null);
    } catch (err) {
      toast.error(errorText(err, "Couldn't update this cohort."));
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href={`${base}?tab=modules`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to {cohort.data.course.name}
      </Link>

      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="font-mono text-[11px] font-medium tracking-[0.1em] text-accent uppercase">
            Module {String(mod.order ?? "").padStart(2, "0")} · {cohort.data.course.name}
          </p>
          <h1 className="font-display text-3xl leading-tight text-balance text-foreground md:text-4xl">
            {mod.title}
          </h1>
        </div>
        {status && (
          <ModuleStatusSelect
            scheduleId={scheduleId}
            moduleId={mod.id}
            title={mod.title}
            status={status}
          />
        )}
      </header>

      {(mod.description || mod.learningObjectives?.length) && (
        <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {mod.description && <RichText html={mod.description} />}
          {!!mod.learningObjectives?.length && (
            <div className="space-y-2">
              <h2 className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
                Objectives
              </h2>
              <ul className="list-disc space-y-1 pl-4 text-sm text-foreground">
                {mod.learningObjectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            recordingPages.setPage(1);
          }}
          placeholder="Search this module"
          aria-label="Search this module"
          className="pl-8"
        />
      </div>

      <Tabs defaultValue="recordings">
        <div className="overflow-x-auto">
          <TabsList className="w-max">
            <TabsTrigger value="recordings">Recordings ({recordings.data?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="materials">Materials ({materials.data?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="assignments">Assignments ({moduleAssignments.length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="recordings" className="pt-4">
          <Ledger
            title="Recordings"
            count={visibleRecordings.length}
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
                  <Link2 className="h-3.5 w-3.5" aria-hidden />
                  Share<span className="hidden sm:inline"> existing</span>
                </Button>
                <Button
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`${base}/recordings?module=${mod.id}`} />}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Add
                </Button>
              </div>
            }
            empty={
              recordings.isLoading
                ? "Loading recordings…"
                : recordings.isError
                  ? "Couldn't load recordings."
                  : q
                    ? "No recordings match."
                    : "No recordings in this module yet."
            }
          >
            {recordingPages.pageItems.map((r) => {
              const shared = sharedIds.has(r.id);
              return (
                <LedgerControlItem
                  key={r.id}
                  className="flex-row items-start sm:items-center"
                  icon={Video}
                  iconClassName="bg-primary/10 text-primary"
                  title={
                    <Link href={`${base}/recordings/${r.id}`} className="hover:text-primary">
                      {r.title}
                    </Link>
                  }
                  meta={
                    <span className="flex flex-wrap items-center gap-2">
                      {r.durationLabel && <span className="font-mono">{r.durationLabel}</span>}
                      {cohortRecordings.isSuccess && !shared && (
                        <Badge variant="outline" className="text-[10px]">
                          <EyeOff className="h-3 w-3" aria-hidden />
                          Not shared
                        </Badge>
                      )}
                    </span>
                  }
                  actions={
                    cohortRecordings.isSuccess &&
                    (shared ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Hide ${r.title} from this cohort`}
                        onClick={() => setDetaching({ kind: "recording", id: r.id, title: r.title })}
                      >
                        <Unlink className="h-4 w-4" aria-hidden />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Share ${r.title} with this cohort`}
                        disabled={pendingShare === r.id}
                        onClick={() => void share(r.id)}
                      >
                        {pendingShare === r.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <Link2 className="h-4 w-4" aria-hidden />
                        )}
                      </Button>
                    ))
                  }
                />
              );
            })}
          </Ledger>
          <Pager
            page={recordingPages.page}
            totalPages={recordingPages.totalPages}
            onPage={recordingPages.setPage}
            label={pluralize(visibleRecordings.length, "recording")}
          />
        </TabsContent>

        <TabsContent value="materials" className="pt-4">
          <Ledger
            title="Materials"
            count={visibleMaterials.length}
            actions={
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href={`${base}/materials?module=${mod.id}`} />}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Add
              </Button>
            }
            empty={
              materials.isLoading
                ? "Loading materials…"
                : materials.isError
                  ? "Couldn't load materials."
                  : q
                    ? "No materials match."
                    : "No materials in this module yet."
            }
          >
            {visibleMaterials.map((m) => (
              <LedgerControlItem
                key={m.id}
                className="flex-row items-start sm:items-center"
                icon={FileText}
                iconClassName="bg-primary/10 text-primary"
                title={
                  <Link href={`${base}/materials/${m.id}`} className="hover:text-primary">
                    {m.title}
                  </Link>
                }
                meta={<span className="capitalize">{m.category ?? m.type}</span>}
                actions={null}
              />
            ))}
          </Ledger>
        </TabsContent>

        <TabsContent value="assignments" className="pt-4">
          <Ledger
            title="Assignments"
            count={moduleAssignments.length}
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setAttachAssignmentOpen(true)}>
                  <Link2 className="h-3.5 w-3.5" aria-hidden />
                  Attach<span className="hidden sm:inline"> existing</span>
                </Button>
                <Button
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`${base}/assignments/new?module=${mod.id}`} />}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  New
                </Button>
              </div>
            }
            empty={
              assignments.isLoading
                ? "Loading assignments…"
                : assignments.isError
                  ? "Couldn't load assignments."
                  : q
                    ? "No assignments match."
                    : "No assignments from this module on this cohort yet."
            }
          >
            {moduleAssignments.map((a) => (
              <LedgerControlItem
                key={a.attachmentId}
                className="flex-row items-start sm:items-center"
                icon={ClipboardList}
                iconClassName="bg-primary/10 text-primary"
                title={
                  <Link href={`${base}/assignments/${a.assignmentId}`} className="hover:text-primary">
                    {a.title}
                  </Link>
                }
                meta={
                  <span>
                    Due {a.dueDate ? formatDate(a.dueDate) : "— not set"} ·{" "}
                    {pluralize(a.submissionCount, "submission")}
                  </span>
                }
                actions={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${a.title} from this cohort`}
                    onClick={() =>
                      setDetaching({ kind: "assignment", id: a.assignmentId, title: a.title })
                    }
                  >
                    <Unlink className="h-4 w-4" aria-hidden />
                  </Button>
                }
              />
            ))}
          </Ledger>
        </TabsContent>
      </Tabs>

      <AttachExistingRecordingDialog
        scheduleId={scheduleId}
        moduleId={mod.id}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
      <AttachExistingAssignmentDialog
        scheduleId={scheduleId}
        moduleId={mod.id}
        open={attachAssignmentOpen}
        onOpenChange={setAttachAssignmentOpen}
      />
      <ConfirmDialog
        open={!!detaching}
        onOpenChange={(o) => !o && setDetaching(null)}
        title={
          detaching?.kind === "recording"
            ? "Hide this recording from the cohort?"
            : "Remove this assignment from the cohort?"
        }
        description={
          <>
            Students in this cohort stop seeing <strong>{detaching?.title}</strong>. It stays in the
            module and in other cohorts, and you can{" "}
            {detaching?.kind === "recording" ? "share" : "attach"} it again from here.
          </>
        }
        confirmLabel={detaching?.kind === "recording" ? "Hide from cohort" : "Remove from cohort"}
        pending={detach.isPending}
        onConfirm={onDetach}
      />
    </div>
  );
}
