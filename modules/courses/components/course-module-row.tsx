"use client";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Play,
  PlayCircle,
  Target,
} from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichText } from "@/components/ui/rich-text";
import { pluralize } from "@/lib/utils";
import type { Module, ModuleCohortStatus } from "@/modules/learning/types";

interface Props {
  /** Resolved course slug — used to build the deep-link into the module. */
  courseSlug: string;
  module: Module;
}

/**
 * Expandable row for the course-overview "Course modules" list, built
 * on the shadcn Accordion. Collapsed: order + title + item count.
 * Expanded: description, learning objectives, estimated duration,
 * per-content-type counts, and the navigate-into-module CTA.
 */
function CohortStatusBadge({
  status,
}: {
  status: ModuleCohortStatus | undefined;
}) {
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
  // "Not started" is the default — stay visually quiet.
  return null;
}

export function CourseModuleRow({ courseSlug, module: m }: Props) {
  const recordings = m.recordings.length;
  const materials = m.materials.length;
  const assignments = m.assignments.length;
  const itemCount = recordings + materials + assignments;
  const objectives = m.learningObjectives || [];
  const hasDetail =
    !!m.summary || objectives.length > 0 || !!m.estimatedDuration;

  const statusBadge = <CohortStatusBadge status={m.cohortStatus} />;

  return (
    <AccordionItem
      value={m.id}
      className="border-b border-border last:border-b-0"
    >
      <AccordionTrigger className="px-5 py-3.5 hover:no-underline">
        <span className="flex items-center gap-4 min-w-0 flex-1 text-left">
          <span className="shrink-0 font-display text-xl tabular-nums text-muted-foreground">
            {m.order.toString().padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-base leading-tight truncate">
              {m.title}
            </span>
            <span className="block text-xs text-muted-foreground mt-0.5">
              {itemCount === 0
                ? "Content on the way"
                : pluralize(itemCount, "item")}
            </span>
          </span>
          <span className="hidden sm:inline-flex shrink-0">{statusBadge}</span>
        </span>
      </AccordionTrigger>

      <AccordionContent className="px-5 pb-4 pt-0">
        <div className="space-y-4 pl-0 sm:pl-12">
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

          {/* Status pill on its own line on small screens */}
          <span className="sm:hidden">{statusBadge}</span>

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
                  {pluralize(recordings, "recording")}
                </span>
              )}
              {materials > 0 && (
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {pluralize(materials, "material")}
                </span>
              )}
              {assignments > 0 && (
                <span className="inline-flex items-center gap-1">
                  <ClipboardList className="h-3.5 w-3.5" />
                  {pluralize(assignments, "assignment")}
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
      </AccordionContent>
    </AccordionItem>
  );
}
