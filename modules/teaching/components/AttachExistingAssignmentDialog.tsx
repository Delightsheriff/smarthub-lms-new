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
import {
  useAttachAssignmentToSchedule,
  useCohortSlackStatus,
  useModuleAssignments,
} from "../api/teaching.queries";
import type { TeachingModule } from "../types";
import { Field, OptionSelect, ToggleRow, moduleOptions } from "./authoring/authoring-kit";
import { isFutureLocalInput } from "./authoring/datetime-local";

/**
 * Attach assignments already filed under a module to this cohort, with
 * one due date. From a module page the module is fixed; from the
 * cohort's Assignments tab the instructor picks it first. Attaches run
 * with allSettled; failures stay selected so a retry only resends them.
 */
export function AttachExistingAssignmentDialog({
  scheduleId,
  open,
  onOpenChange,
  moduleId: fixedModuleId,
  modules,
}: {
  scheduleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fixed module (module page). Omit to show a module picker. */
  moduleId?: string;
  /** Cohort modules for the picker when `moduleId` is omitted. */
  modules?: TeachingModule[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <AttachForm
            scheduleId={scheduleId}
            fixedModuleId={fixedModuleId}
            modules={modules ?? []}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AttachForm({
  scheduleId,
  fixedModuleId,
  modules,
  onDone,
}: {
  scheduleId: string;
  fixedModuleId?: string;
  modules: TeachingModule[];
  onDone: () => void;
}) {
  const [pickedModule, setPickedModule] = useState("");
  const moduleId = fixedModuleId ?? pickedModule;
  const library = useModuleAssignments(moduleId || undefined);
  const slack = useCohortSlackStatus(scheduleId);
  const attach = useAttachAssignmentToSchedule();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [allowLate, setAllowLate] = useState(true);
  const [notifySlack, setNotifySlack] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const available = useMemo(
    () => (library.data ?? []).filter((a) => !a.attachedScheduleIds.includes(scheduleId)),
    [library.data, scheduleId],
  );
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? available.filter((a) => a.title.toLowerCase().includes(q)) : available;
  }, [available, search]);
  const allFilteredOn = filtered.length > 0 && filtered.every((a) => selected.has(a.assignmentId));

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
      for (const a of filtered) {
        if (allFilteredOn) next.delete(a.assignmentId);
        else next.add(a.assignmentId);
      }
      return next;
    });

  const slackConnected = !!slack.data?.connected;
  const dueOk = isFutureLocalInput(dueDate);
  const canSubmit = selected.size > 0 && dueOk && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const ids = [...selected];
    const due = new Date(dueDate).toISOString();
    const results = await Promise.allSettled(
      ids.map((assignmentId) =>
        attach.mutateAsync({
          assignmentId,
          scheduleId,
          payload: {
            dueDate: due,
            allowLateSubmission: allowLate,
            notifySlack: notifySlack && slackConnected,
          },
        }),
      ),
    );
    setSubmitting(false);
    const failedIds = ids.filter((_, i) => results[i]?.status !== "fulfilled");
    const ok = ids.length - failedIds.length;
    if (!failedIds.length) {
      toast.success(`Attached ${pluralize(ok, "assignment")}`);
      onDone();
      return;
    }
    const titles = failedIds
      .map((id) => available.find((a) => a.assignmentId === id)?.title ?? id)
      .join(", ");
    toast.error(`Attached ${ok}; ${failedIds.length} failed: ${titles}`);
    setSelected(new Set(failedIds));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Attach existing assignments</DialogTitle>
        <DialogDescription>
          Reuse assignments already filed under a module. Students in this cohort see them once
          attached.
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
        {!fixedModuleId && (
          <Field id="attach-module" label="Module">
            <OptionSelect
              id="attach-module"
              value={pickedModule}
              onChange={(v) => {
                setPickedModule(v);
                setSelected(new Set());
                setSearch("");
              }}
              options={moduleOptions(modules)}
              placeholder="Choose a module"
            />
          </Field>
        )}

        {moduleId &&
          (library.isLoading ? (
            <div className="space-y-2" aria-busy="true">
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          ) : library.isError ? (
            <div className="flex items-center justify-between gap-3 text-sm text-destructive" role="alert">
              Couldn&apos;t load this module&apos;s assignments.
              <Button variant="outline" size="sm" onClick={() => library.refetch()}>
                Try again
              </Button>
            </div>
          ) : !available.length ? (
            <p className="text-sm text-muted-foreground">
              Every assignment in this module is already attached to this cohort.
            </p>
          ) : (
            <fieldset className="space-y-2">
              <legend className="sr-only">Assignments to attach</legend>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search assignments"
                    aria-label="Search assignments"
                    className="pl-8"
                  />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={toggleAll} disabled={!filtered.length}>
                  {allFilteredOn ? "Clear" : "Select all"}
                </Button>
              </div>
              <ul className="divide-y divide-border border-y border-border">
                {filtered.map((a) => {
                  const cbId = `attach-${a.assignmentId}`;
                  return (
                    <li key={a.assignmentId} className="flex items-center gap-3 py-2.5">
                      <Checkbox
                        id={cbId}
                        checked={selected.has(a.assignmentId)}
                        onCheckedChange={() => toggle(a.assignmentId)}
                      />
                      <Label htmlFor={cbId} className="min-w-0 flex-1 cursor-pointer font-normal">
                        <span className="block truncate">{a.title}</span>
                        {a.isPublished === false && (
                          <span className="text-xs text-muted-foreground">Unpublished</span>
                        )}
                      </Label>
                      {typeof a.totalPoints === "number" && (
                        <span className="font-mono text-xs text-muted-foreground">
                          {a.totalPoints} pts
                        </span>
                      )}
                    </li>
                  );
                })}
                {!filtered.length && (
                  <li className="py-3 text-sm text-muted-foreground">No matches.</li>
                )}
              </ul>
              <p className="text-xs text-muted-foreground">{selected.size} selected</p>
            </fieldset>
          ))}

        <Field
          id="attach-due"
          label="Due date and time"
          error={dueDate && !dueOk ? "Pick a date in the future" : undefined}
        >
          <Input
            id="attach-due"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Field>
        <ToggleRow
          id="attach-late"
          label="Accept late submissions"
          checked={allowLate}
          onCheckedChange={setAllowLate}
        />
        <ToggleRow
          id="attach-slack"
          label={
            slackConnected ? `Post to #${slack.data?.channelName ?? "Slack"}` : "Post to Slack"
          }
          description={slackConnected ? undefined : "This cohort has no Slack channel connected."}
          checked={notifySlack && slackConnected}
          onCheckedChange={setNotifySlack}
          disabled={!slackConnected}
        />
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onDone} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!canSubmit}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {selected.size > 1 ? `Attach ${selected.size}` : "Attach"}
        </Button>
      </DialogFooter>
    </>
  );
}
