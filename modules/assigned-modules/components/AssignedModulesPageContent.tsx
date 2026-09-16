"use client";
import { Clock, FileText, Notebook, Sparkles, Video } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { CollapsibleRichText } from "@/components/ui/collapsible-rich-text";
import {
  MaterialsSection,
  RecordingsSection,
} from "@/modules/learning/components/module-section";
import { useAssignedModules } from "../api/assigned-modules.queries";
import type { AssignedAssignment, AssignedModule } from "../types";

/**
 * "Assigned to you" — standalone modules an instructor granted a
 * student outside any course. Recordings and materials reuse the
 * learning module's sections; assignments render read-only because
 * these modules carry no course slug (so no submission route exists).
 */
export function AssignedModulesPageContent() {
  const { data, isLoading, error } = useAssignedModules();

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        eyebrow="Learning"
        title="Assigned to you"
        description="Extra modules your instructors have shared with you."
      />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      )}

      {error && (
        <Card className="p-6 border-destructive/30 bg-destructive/5 rounded-2xl">
          <p className="text-sm text-destructive">
            Couldn&apos;t load your assigned modules. Please try again.
          </p>
        </Card>
      )}

      {!isLoading && !error && (data?.length ?? 0) === 0 && (
        <EmptyState
          icon={Sparkles}
          title="Nothing assigned yet"
          description="When an instructor shares a standalone module with you, it'll show up here alongside its recordings, materials, and tasks."
        />
      )}

      {!isLoading && !error && (data?.length ?? 0) > 0 && (
        <Accordion className="space-y-3">
          {data!.map((mod) => (
            <AssignedModuleCard key={mod.id} module={mod} />
          ))}
        </Accordion>
      )}
    </div>
  );
}

function AssignedModuleCard({ module: mod }: { module: AssignedModule }) {
  const counts = [
    mod.recordings.length &&
      `${mod.recordings.length} recording${mod.recordings.length > 1 ? "s" : ""}`,
    mod.materials.length &&
      `${mod.materials.length} material${mod.materials.length > 1 ? "s" : ""}`,
    mod.assignments.length &&
      `${mod.assignments.length} task${mod.assignments.length > 1 ? "s" : ""}`,
  ].filter(Boolean) as string[];

  return (
    <AccordionItem
      value={mod.id}
      className="rounded-2xl border bg-card overflow-hidden"
    >
      <AccordionTrigger className="px-4 py-4 hover:no-underline">
        <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
          <span className="text-base font-semibold leading-tight">
            {mod.title}
          </span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {mod.estimatedDuration && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {mod.estimatedDuration}
              </span>
            )}
            {counts.length > 0 && <span>{counts.join(" · ")}</span>}
          </span>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4 pt-0">
        <div className="space-y-5">
          {mod.description && (
            <div className="text-sm text-muted-foreground">
              <CollapsibleRichText html={mod.description} maxHeight={96} />
            </div>
          )}

          {mod.note && (
            <div className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                Note from your instructor
              </p>
              <p className="mt-1 text-sm text-foreground">{mod.note}</p>
            </div>
          )}

          {mod.learningObjectives.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                What you&apos;ll learn
              </h3>
              <ul className="mt-2 space-y-1.5">
                {mod.learningObjectives.map((obj, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Section icon={Video} title="Recordings">
            <RecordingsSection items={mod.recordings} />
          </Section>

          <Section icon={FileText} title="Materials">
            <MaterialsSection items={mod.materials} />
          </Section>

          <Section icon={Notebook} title="Tasks">
            <AssignedAssignmentsList items={mod.assignments} />
          </Section>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * Read-only task list. Deliberately no link / status badge: these
 * standalone modules have no course slug, so there's no submission
 * route to open. Students see the brief; submission (if any) happens
 * out of band.
 */
function AssignedAssignmentsList({ items }: { items: AssignedAssignment[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed py-6 text-center text-sm text-muted-foreground">
        No tasks yet
      </p>
    );
  }

  return (
    <ul className="divide-y rounded-2xl border bg-card">
      {items.map((a) => (
        <li key={a.id} className="px-4 py-3">
          <p className="text-sm font-medium leading-tight">{a.title}</p>
          {a.dueLabel && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Due {a.dueLabel}
            </p>
          )}
          {a.description && (
            <div className="mt-2 text-xs text-muted-foreground">
              <CollapsibleRichText html={a.description} maxHeight={72} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
