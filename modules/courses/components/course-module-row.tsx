"use client";
import { useState, type ReactElement } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ChevronDown,
  Clock,
  ClipboardList,
  FileText,
  PlayCircle,
  Target,
  CheckCircle2,
  Play,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichText } from "@/components/ui/rich-text";
import { cn } from "@/lib/utils";
import type { Module, ModuleCohortStatus } from "@/modules/learning/types";

interface Props {
  /** Resolved course slug — used to build the deep-link into the module. */
  courseSlug: string;
  module: Module;
}

/**
 * Expandable row for the course-overview "Course modules" list.
 * Collapsed: order + title + item count. Expanded: description,
 * learning objectives, estimated duration, per-content-type counts,
 * and the navigate-into-module CTA.
 */
function cohortStatusBadge(
  status: ModuleCohortStatus | undefined,
): ReactElement | null {
  if (status === "in-progress") {
    return (
      <Badge variant="outline" className="shrink-0">
        <Play className="h-3 w-3 mr-1" />
        In progress
      </Badge>
    );
  }
  if (status === "completed") {
    return (
      <Badge variant="default" className="shrink-0">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Completed
      </Badge>
    );
  }
  return null;
}

export function CourseModuleRow({ courseSlug, module: m }: Props) {
  const [open, setOpen] = useState(false);

  const recordings = m.recordings.length;
  const materials = m.materials.length;
  const assignments = m.assignments.length;
  const itemCount = recordings + materials + assignments;
  const objectives = m.learningObjectives || [];
  const hasDetail =
    !!m.summary || objectives.length > 0 || !!m.estimatedDuration;

  // Per-cohort status pill. "Not started" is the default and we skip
  // rendering for it to keep the row visually quiet.
  const statusBadge = cohortStatusBadge(m.cohortStatus);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-4 px-5 py-3.5 hover:bg-muted/50 transition-colors text-left",
          m.cohortStatus === "in-progress" && "border-l-2 border-l-accent",
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold tabular-nums">
          {m.order.toString().padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight truncate">
            {m.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {itemCount === 0
              ? "Content on the way"
              : `${itemCount} item${itemCount === 1 ? "" : "s"}`}
          </p>
        </div>
        {statusBadge}
        <motion.span
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.2 },
            }}
            className="overflow-hidden bg-muted/20"
          >
            <div className="px-5 pb-4 pt-1 space-y-4">
              {/* Description */}
              {m.summary && (
                <RichText
                  html={m.summary}
                  className="text-sm text-muted-foreground"
                />
              )}

              {/* Learning objectives */}
              {objectives.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold inline-flex items-center gap-1.5">
                    <Target className="h-3 w-3" />
                    What you&apos;ll learn
                  </p>
                  <ul className="text-sm space-y-1 pl-5 list-disc marker:text-primary">
                    {objectives.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Meta strip — duration + content counts */}
              {(m.estimatedDuration || itemCount > 0) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  {m.estimatedDuration ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {m.estimatedDuration} min
                    </span>
                  ) : null}
                  {recordings > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <PlayCircle className="h-3.5 w-3.5" />
                      {recordings} recording{recordings === 1 ? "" : "s"}
                    </span>
                  )}
                  {materials > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {materials} material{materials === 1 ? "" : "s"}
                    </span>
                  )}
                  {assignments > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <ClipboardList className="h-3.5 w-3.5" />
                      {assignments} assignment{assignments === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
              )}

              {/* Empty-detail fallback so an expanded shell isn't blank */}
              {!hasDetail && itemCount === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  Content for this module hasn&apos;t been published yet.
                </p>
              )}

              <div>
                <Button
                  size="sm"
                  variant="outline"
                  render={
                    <Link href={`/courses/${courseSlug}/modules/${m.slug}`} />
                  }
                >
                  Open module
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
