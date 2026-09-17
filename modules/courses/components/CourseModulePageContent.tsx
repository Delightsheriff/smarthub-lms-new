"use client";
import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Play,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AssignmentsSection,
  MaterialsSection,
  RecordingsSection,
} from "@/modules/learning/components/module-section";
import { PageHeader } from "@/components/layout/page-header";
import { useCourseModule } from "../api/courses.queries";
import { RichText } from "@/components/ui/rich-text";
import type { ModuleCohortStatus } from "@/modules/learning/types";

type TabKey = "recordings" | "materials" | "assignments";

/**
 * Per-cohort delivery status for the module, mirroring the badge on the
 * course-overview rows. Unlike the overview — which stays quiet on
 * `not-started` — the detail page renders all three states so a student
 * on a module always sees where the cohort stands on it.
 */
function ModuleStatusBadge({
  status,
}: {
  status: ModuleCohortStatus | undefined;
}) {
  if (status === "completed") {
    return (
      <Badge variant="default">
        <CheckCircle2 className="h-3 w-3" />
        Completed
      </Badge>
    );
  }
  if (status === "in-progress") {
    return (
      <Badge variant="outline">
        <Play className="h-3 w-3" />
        In progress
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      <Circle className="h-3 w-3" />
      Not started
    </Badge>
  );
}

/** Map a hash anchor (`#recording-x`, `#material-x`, `#assignment-x`)
 *  back to the tab that contains it. Returns null when there's no hash
 *  or it doesn't match a known prefix. */
function tabFromHash(hash: string): TabKey | null {
  if (hash.startsWith("#recording-")) return "recordings";
  if (hash.startsWith("#material-")) return "materials";
  if (hash.startsWith("#assignment-")) return "assignments";
  return null;
}

/** Content of the single-module page — tabs + hash sync + prev/next. */
export function CourseModulePageContent({
  slug,
  moduleSlug,
}: {
  slug: string;
  moduleSlug: string;
}) {
  const { data, isLoading } = useCourseModule(slug, moduleSlug);

  // Which lanes have content? Empty tabs are hidden so we never render
  // a "click to see nothing" affordance.
  const visibleTabs = useMemo<TabKey[]>(() => {
    if (!data) return [];
    const m = data.module;
    const list: TabKey[] = [];
    if (m.recordings.length > 0) list.push("recordings");
    if (m.materials.length > 0) list.push("materials");
    if (m.assignments.length > 0) list.push("assignments");
    return list;
  }, [data]);

  const [tab, setTab] = useState<TabKey>("recordings");

  // Tab + hash sync — activate the matching tab on cold load / hashchange,
  // then scroll to the anchor after the tab commit.
  useEffect(() => {
    if (!data || visibleTabs.length === 0) return;

    const sync = () => {
      const hashTab = tabFromHash(window.location.hash);
      const target =
        hashTab && visibleTabs.includes(hashTab) ? hashTab : visibleTabs[0];
      if (target) setTab(target);

      const hash = window.location.hash;
      if (!hash) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = document.querySelector(hash);
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    };

    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [data, visibleTabs]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-12 w-72 rounded-full" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const { course, module: mod, modules } = data;
  const idx = modules.findIndex((m) => m.id === mod.id);
  const prev = idx > 0 ? modules[idx - 1] : null;
  const next = idx < modules.length - 1 ? modules[idx + 1] : null;

  const labels: Record<TabKey, string> = {
    recordings: "Recordings",
    materials: "Materials",
    assignments: "Assignments",
  };
  const counts: Record<TabKey, number> = {
    recordings: mod.recordings.length,
    materials: mod.materials.length,
    assignments: mod.assignments.length,
  };

  const hasRail =
    mod.summary || (mod.learningObjectives && mod.learningObjectives.length > 0);

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <Link
          href={`/courses/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {course.name}
        </Link>
      </div>

      {/* Masthead */}
      <PageHeader
        variant="editorial"
        divider
        dateline={`Module ${mod.order.toString().padStart(2, "0")} · ${course.name}`}
        title={mod.title}
        description={<ModuleStatusBadge status={mod.cohortStatus} />}
      />

      {/* Reading + Rail */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_300px]">
        {/* Reading column — lesson content tabs */}
        <div className="min-w-0">
          {visibleTabs.length === 0 ? (
            <div className="rounded-[20px] border border-border bg-card p-8 text-center">
              <Sparkles className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="font-display text-base font-semibold">Content on the way</p>
              <p className="text-sm text-muted-foreground mt-1">
                Recordings, materials, and assignments for this module will
                appear here once they&apos;re published.
              </p>
            </div>
          ) : (
            <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="space-y-4">
              <div className="overflow-x-auto pb-1 max-w-full -mx-1 px-1">
                <TabsList className="w-max">
                  {visibleTabs.map((key) => (
                    <TabsTrigger key={key} value={key}>
                      {labels[key]}
                      <span className="ml-1.5 text-[10px] text-muted-foreground tabular-nums">
                        {counts[key]}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {visibleTabs.includes("recordings") && (
                <TabsContent value="recordings">
                  <RecordingsSection items={mod.recordings} />
                </TabsContent>
              )}
              {visibleTabs.includes("materials") && (
                <TabsContent value="materials">
                  <MaterialsSection items={mod.materials} />
                </TabsContent>
              )}
              {visibleTabs.includes("assignments") && (
                <TabsContent value="assignments">
                  <AssignmentsSection
                    items={mod.assignments}
                    courseSlug={slug}
                    moduleSlug={mod.slug}
                  />
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>

        {/* Sticky rail — overview, objectives, prev/next nav */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          {hasRail && (
            <div className="rounded-[20px] border border-border bg-card px-5 pb-2 pt-4">
              <Accordion defaultValue={["overview", "objectives"]}>
                {mod.summary && (
                  <AccordionItem value="overview">
                    <AccordionTrigger className="font-display text-sm font-semibold">
                      Overview
                    </AccordionTrigger>
                    <AccordionContent>
                      <RichText
                        html={mod.summary}
                        className="text-muted-foreground pb-1 text-xs"
                      />
                    </AccordionContent>
                  </AccordionItem>
                )}

                {mod.learningObjectives && mod.learningObjectives.length > 0 && (
                  <AccordionItem value="objectives" className="border-b-0">
                    <AccordionTrigger className="font-display text-sm font-semibold">
                      What you&apos;ll learn
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pb-1">
                        {mod.learningObjectives.map((objective, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-xs text-muted-foreground"
                          >
                            <Check
                              className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent"
                            />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          )}

          {/* Prev / Next */}
          <nav
            aria-label="Module navigation"
            className="flex flex-col gap-2"
          >
            {prev && (
              <Link
                href={`/courses/${slug}/modules/${prev.slug}`}
                className="group flex flex-col gap-0.5 text-sm rounded-[20px] border border-border bg-card p-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all shadow-sm"
              >
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" />
                  Previous
                </span>
                <span className="font-display font-medium truncate group-hover:text-accent transition-colors">
                  {prev.title}
                </span>
              </Link>
            )}
            {next && (
              <Link
                href={`/courses/${slug}/modules/${next.slug}`}
                className="group flex flex-col items-end gap-0.5 text-sm rounded-[20px] border border-border bg-card p-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all shadow-sm text-right"
              >
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1">
                  Next
                  <ArrowRight className="h-3 w-3" />
                </span>
                <span className="font-display font-medium truncate group-hover:text-accent transition-colors">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        </aside>
      </div>
    </div>
  );
}
