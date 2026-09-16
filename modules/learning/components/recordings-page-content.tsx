"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock, PlayCircle, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CollapsibleRichText } from "@/components/ui/collapsible-rich-text";
import { RecordingPlayerDialog } from "./recording-player-dialog";
import { useMyRecordings } from "../api/content.queries";
import { cn, formatDate } from "@/lib/utils";
import type { RecordingWithContext } from "../types";

type Filter = "all" | "unwatched" | "watched";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unwatched", label: "Unwatched" },
  { value: "watched", label: "Watched" },
];

/** All recordings surface. Every visible recording across the
 *  student's enrolments, grouped by course / module. */
export function RecordingsPageContent() {
  const { data, isLoading } = useMyRecordings();
  const [filter, setFilter] = useState<Filter>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const rows = useMemo(() => data || [], [data]);

  const visible = useMemo(() => {
    switch (filter) {
      case "unwatched":
        return rows.filter((r) => !r.recording.watched);
      case "watched":
        return rows.filter((r) => r.recording.watched);
      default:
        return rows;
    }
  }, [rows, filter]);

  // Group the flat feed into course / recordings.
  const groups = useMemo(() => groupByCourse(visible), [visible]);

  // Never open a locked recording, even if some other path set activeId.
  const active =
    rows.find((r) => r.recording.id === activeId && !r.recording.isLocked)
      ?.recording || null;

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        eyebrow="Learning"
        title="Recordings"
        description="Every class recording available to you, across all your courses."
        actions={
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList className="rounded-xl bg-muted/60 p-1">
              {FILTERS.map((f) => (
                <TabsTrigger key={f.value} value={f.value} className="rounded-lg text-xs">
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && visible.length === 0 && (
        <EmptyState
          icon={Video}
          title="No recordings"
          description={
            filter === "all"
              ? "Recordings show up here once your tutor publishes them."
              : "Switch the filter to see other recordings."
          }
        />
      )}

      {!isLoading &&
        groups.map((g) => (
          <section key={g.course.id} className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: g.course.color || "var(--primary)" }}
              />
              <Link
                href={`/courses/${g.course.slug}`}
                className="font-display text-base font-semibold hover:text-accent transition-colors"
              >
                {g.course.name}
              </Link>
              <span className="text-xs text-muted-foreground font-sans">
                {g.items.length} recording{g.items.length === 1 ? "" : "s"}
              </span>
            </div>

            <Card className="p-0 overflow-hidden rounded-2xl border-border">
              <ul className="divide-y">
                {g.items.map((row) => {
                  const r = row.recording;
                  const locked = r.isLocked;
                  const open = () => {
                    if (!locked) setActiveId(r.id);
                  };
                  return (
                    <li
                      key={r.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3",
                        locked && "opacity-60",
                      )}
                    >
                      {locked ? (
                        <span
                          className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground"
                          aria-hidden
                        >
                          <Lock className="h-5 w-5" />
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={open}
                          aria-label={`Play ${r.title}`}
                          className="mt-0.5 shrink-0 rounded-full text-primary"
                        >
                          {r.watched ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <PlayCircle className="h-5 w-5" />
                          )}
                        </Button>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {row.module.order != null
                            ? `Module ${row.module.order
                                .toString()
                                .padStart(2, "0")} · `
                            : ""}
                          {row.module.title}
                        </p>
                        {locked ? (
                          <p className="text-sm font-medium leading-tight text-muted-foreground">
                            {r.title}
                          </p>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={open}
                            className="h-auto p-0 text-left text-sm font-medium leading-tight text-foreground hover:text-primary"
                          >
                            {r.title}
                          </Button>
                        )}
                        {locked ? (
                          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3" />
                            Not available to you
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {r.durationLabel}
                            {r.durationLabel && r.publishedAt ? " · " : ""}
                            {r.publishedAt
                              ? `published ${formatDate(r.publishedAt)}`
                              : ""}
                          </p>
                        )}
                        {!locked && r.description && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <CollapsibleRichText
                              html={r.description}
                              maxHeight={72}
                            />
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/courses/${g.course.slug}/modules/${row.module.slug}`}
                        className="shrink-0 self-center text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Open module"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </section>
        ))}

      <RecordingPlayerDialog
        recording={active}
        open={!!active}
        onOpenChange={(o) => {
          if (!o) setActiveId(null);
        }}
      />
    </div>
  );
}

interface CourseGroup {
  course: RecordingWithContext["course"];
  items: RecordingWithContext[];
}

function groupByCourse(rows: RecordingWithContext[]): CourseGroup[] {
  const map = new Map<string, CourseGroup>();
  for (const row of rows) {
    const existing = map.get(row.course.id);
    if (existing) existing.items.push(row);
    else map.set(row.course.id, { course: row.course, items: [row] });
  }
  return Array.from(map.values());
}
