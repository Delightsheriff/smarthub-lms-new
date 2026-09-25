"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { IndexList } from "@/components/ui/index-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, htmlToPlainText, pluralize } from "@/lib/utils";
import { useCohortModules, useSetCohortModuleStatus } from "../api/teaching.queries";
import {
  COHORT_MODULE_STATUS_OPTIONS,
  type CohortModuleStatus,
  type TeachingModule,
} from "../types";
import { errorText } from "./authoring/authoring-kit";

interface CohortModulesTabProps {
  scheduleId: string;
  modules: TeachingModule[];
}

/**
 * The cohort's modules in course order. Each row opens the module page
 * (recordings, materials, assignments for this cohort) and carries the
 * per-cohort status, which the instructor can move on from here.
 */
export function CohortModulesTab({ scheduleId, modules }: CohortModulesTabProps) {
  const statuses = useCohortModules(scheduleId);

  if (modules.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-xs text-muted-foreground">
        No modules created for this syllabus yet.
      </div>
    );
  }

  const statusById = new Map((statuses.data ?? []).map((r) => [r.moduleId, r.status]));

  return (
    <IndexList>
      {modules.map((m, idx) => {
        const href = `/teach/cohorts/${scheduleId}/modules/${m.slug || m.id}`;
        return (
          <div
            key={m.id}
            className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-x-4 gap-y-2 border-b border-border py-4 sm:grid-cols-[34px_minmax(0,1fr)_140px_160px]"
          >
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {String(m.order ?? idx + 1).padStart(2, "0")}
            </span>
            <Link href={href} className="group min-w-0">
              <span className="flex items-center gap-1.5 truncate font-display text-sm font-semibold text-foreground group-hover:text-primary">
                {m.title}
                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </span>
              {m.description && (
                <span className="block truncate text-xs text-muted-foreground">
                  {htmlToPlainText(m.description)}
                </span>
              )}
            </Link>
            <span className="col-start-2 font-mono text-[11px] text-muted-foreground sm:col-start-auto">
              {pluralize(m.assignmentCount ?? 0, "task")} ·{" "}
              {pluralize(m.recordingCount ?? 0, "video")}
            </span>
            <div className="col-start-2 sm:col-start-auto">
              {statuses.isSuccess && (
                <ModuleStatusSelect
                  scheduleId={scheduleId}
                  moduleId={m.id}
                  title={m.title}
                  status={statusById.get(m.id) ?? "not-started"}
                />
              )}
            </div>
          </div>
        );
      })}
    </IndexList>
  );
}

const STATUS_DOT: Record<CohortModuleStatus, string> = {
  "not-started": "bg-muted-foreground/40",
  "in-progress": "bg-warning",
  completed: "bg-success",
};

/** Status picker shared by the modules tab and the module page. */
export function ModuleStatusSelect({
  scheduleId,
  moduleId,
  title,
  status,
}: {
  scheduleId: string;
  moduleId: string;
  title: string;
  status: CohortModuleStatus;
}) {
  const setStatus = useSetCohortModuleStatus(scheduleId);
  const label = (s: string | null) =>
    COHORT_MODULE_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? "Not started";

  return (
    <Select
      value={status}
      disabled={setStatus.isPending}
      onValueChange={(next) => {
        if (!next || next === status) return;
        setStatus.mutate(
          { moduleId, status: next as CohortModuleStatus },
          {
            onSuccess: () => toast.success(`${title}: ${label(next as string).toLowerCase()}`),
            onError: (err) => toast.error(errorText(err, "Couldn't update the module status.")),
          },
        );
      }}
    >
      <SelectTrigger
        size="sm"
        aria-label={`Status of ${title}`}
        className="w-full rounded-xl text-xs *:data-[slot=select-value]:normal-case sm:w-[150px]"
      >
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[status])} aria-hidden />
        <SelectValue>{(v: string | null) => label(v)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {COHORT_MODULE_STATUS_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
