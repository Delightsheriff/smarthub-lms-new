"use client";

import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { pluralize } from "@/lib/utils";
import { useRecordingsByModule } from "@/modules/learning/api/content.queries";
import { useAttachRecordingToSchedule, useCohortRecordings } from "../api/teaching.queries";

/**
 * Share recordings already in a module with this cohort. A recording
 * that was hidden from the cohort counts as available — attaching flips
 * the existing row back on rather than creating a duplicate.
 */
export function AttachExistingRecordingDialog({
  scheduleId,
  moduleId,
  open,
  onOpenChange,
}: {
  scheduleId: string;
  moduleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <AttachForm scheduleId={scheduleId} moduleId={moduleId} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AttachForm({
  scheduleId,
  moduleId,
  onDone,
}: {
  scheduleId: string;
  moduleId: string;
  onDone: () => void;
}) {
  const moduleRecordings = useRecordingsByModule(moduleId);
  const cohortRecordings = useCohortRecordings(scheduleId);
  const attach = useAttachRecordingToSchedule(scheduleId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const available = useMemo(() => {
    const shared = new Set(
      (cohortRecordings.data ?? []).filter((r) => r.isVisible).map((r) => r.recordingId),
    );
    return (moduleRecordings.data ?? []).filter((r) => !shared.has(r.id));
  }, [moduleRecordings.data, cohortRecordings.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? available.filter((r) => r.title.toLowerCase().includes(q)) : available;
  }, [available, search]);
  const allOn = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const r of filtered) {
        if (allOn) next.delete(r.id);
        else next.add(r.id);
      }
      return next;
    });

  const submit = async () => {
    if (!selected.size || submitting) return;
    setSubmitting(true);
    const ids = [...selected];
    const results = await Promise.allSettled(ids.map((id) => attach.mutateAsync(id)));
    setSubmitting(false);
    const failed = ids.filter((_, i) => results[i]?.status !== "fulfilled");
    const ok = ids.length - failed.length;
    if (!failed.length) {
      toast.success(`Shared ${pluralize(ok, "recording")} with this cohort`);
      onDone();
      return;
    }
    toast.error(`Shared ${ok}; ${failed.length} failed. Try those again.`);
    setSelected(new Set(failed));
  };

  const loading = moduleRecordings.isLoading || cohortRecordings.isLoading;
  const failedLoad = moduleRecordings.isError || cohortRecordings.isError;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Share existing recordings</DialogTitle>
        <DialogDescription>
          Pick recordings already in this module. Students in this cohort see them once shared.
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
        {loading ? (
          <div className="space-y-2" aria-busy="true">
            <Skeleton className="h-9 w-full rounded-xl" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        ) : failedLoad ? (
          <div className="flex items-center justify-between gap-3 text-sm text-destructive" role="alert">
            Couldn&apos;t load the recordings.
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void moduleRecordings.refetch();
                void cohortRecordings.refetch();
              }}
            >
              Try again
            </Button>
          </div>
        ) : !available.length ? (
          <p className="text-sm text-muted-foreground">
            Every recording in this module is already shared with this cohort.
          </p>
        ) : (
          <fieldset className="space-y-2">
            <legend className="sr-only">Recordings to share</legend>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search recordings"
                  aria-label="Search recordings"
                  className="pl-8"
                />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={toggleAll} disabled={!filtered.length}>
                {allOn ? "Clear" : "Select all"}
              </Button>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {filtered.map((r) => {
                const cbId = `share-${r.id}`;
                return (
                  <li key={r.id} className="flex items-center gap-3 py-2.5">
                    <Checkbox id={cbId} checked={selected.has(r.id)} onCheckedChange={() => toggle(r.id)} />
                    <Label htmlFor={cbId} className="min-w-0 flex-1 cursor-pointer truncate font-normal">
                      {r.title}
                    </Label>
                    {r.durationLabel && (
                      <span className="font-mono text-xs text-muted-foreground">{r.durationLabel}</span>
                    )}
                  </li>
                );
              })}
              {!filtered.length && <li className="py-3 text-sm text-muted-foreground">No matches.</li>}
            </ul>
            <p className="text-xs text-muted-foreground">{selected.size} selected</p>
          </fieldset>
        )}
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onDone} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!selected.size || submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {selected.size > 1 ? `Share ${selected.size}` : "Share"}
        </Button>
      </DialogFooter>
    </>
  );
}
