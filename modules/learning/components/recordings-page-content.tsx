"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock, PlayCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { CollapsibleRichText } from "@/components/ui/collapsible-rich-text";
import { IndexList } from "@/components/ui/index-list";
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
  const { data, isLoading, isFetching, refetch } = useMyRecordings();
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

  const dateline = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const unwatched = rows.filter((r) => !r.recording.watched && !r.recording.isLocked);
  const watchedCount = rows.filter((r) => r.recording.watched).length;
  const nextToWatch = unwatched[0];

  // Never open a locked recording, even if some other path set activeId.
  const active =
    rows.find((r) => r.recording.id === activeId && !r.recording.isLocked)
      ?.recording || null;

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        divider
        dateline={dateline}
        title="Class Recordings"
        description={
          !isLoading ? (
            rows.length === 0 ? (
              "Class recordings will appear here as your tutors publish live session replays."
            ) : (
              <>
                <strong className="text-foreground">{rows.length}</strong> {rows.length === 1 ? "recording" : "recordings"} available
                {unwatched.length > 0 ? (
                  <>
                    {" "}
                    · <strong className="text-foreground">{unwatched.length}</strong> unwatched
                  </>
                ) : (
                  <>
                    {" "}
                    · <strong className="text-foreground">all caught up</strong>
                  </>
                )}
                {watchedCount > 0 && (
                  <>
                    {" "}
                    · <strong className="text-foreground">{watchedCount}</strong> completed
                  </>
                )}
              </>
            )
          ) : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            <RefreshButton loading={isFetching} onClick={refetch} />
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList className="rounded-xl bg-muted/60 p-1">
                {FILTERS.map((f) => (
                  <TabsTrigger key={f.value} value={f.value} className="rounded-lg text-xs">
                    {f.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        }
      />

      {/* Hero for next unwatched recording */}
      {!isLoading && filter === "all" && nextToWatch && (
        <div className="flex flex-col justify-between overflow-hidden rounded-[20px] border border-border bg-card p-5 md:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-primary font-medium">
                  Next to watch
                </span>
                {nextToWatch.recording.durationLabel && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {nextToWatch.recording.durationLabel}
                  </span>
                )}
              </div>
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                {[nextToWatch.course.name, nextToWatch.module.title].filter(Boolean).join(" · ")}
              </p>
              <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground">
                {nextToWatch.recording.title}
              </h2>
              {nextToWatch.recording.description && (
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {nextToWatch.recording.description}
                </p>
              )}
            </div>

            <Button
              type="button"
              onClick={() => setActiveId(nextToWatch.recording.id)}
              className="rounded-xl bg-primary text-primary-foreground font-semibold shrink-0 gap-2 self-start md:self-center"
            >
              <PlayCircle className="h-4 w-4" /> Watch replay
            </Button>
          </div>
        </div>
      )}

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

      {/* Course-grouped IndexList rows */}
      {!isLoading &&
        groups.map((g) => (
          <section key={g.course.id} className="space-y-1">
            {/* Course heading */}
            <div className="flex items-baseline justify-between pb-2 pt-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: g.course.color || "var(--primary)" }}
                />
                <Link
                  href={`/courses/${g.course.slug}`}
                  className="font-display text-base font-semibold text-foreground hover:text-accent transition-colors"
                >
                  {g.course.name}
                </Link>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {g.items.length} {g.items.length === 1 ? "recording" : "recordings"}
              </span>
            </div>

            {/* IndexList — numbered hairline rows within this course */}
            <IndexList>
              {g.items.map((row, idx) => {
                const r = row.recording;
                const locked = r.isLocked;
                const open = () => {
                  if (!locked) setActiveId(r.id);
                };
                return (
                  <div
                    key={r.id}
                    className={cn(
                      "flex items-start justify-between gap-3 border-b border-border px-0 py-3.5 transition-colors hover:bg-muted/30",
                      locked && "opacity-60",
                    )}
                  >
                    {/* Number */}
                    <span className="font-mono text-xs tabular-nums text-muted-foreground w-6 shrink-0 mt-0.5">
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    {/* Play or locked chip */}
                    {locked ? (
                      <span
                        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                        aria-hidden
                      >
                        <Lock className="h-4 w-4" />
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={open}
                        aria-label={`Play ${r.title}`}
                        className="mt-0.5 shrink-0 rounded-xl bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        {r.watched ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <PlayCircle className="h-4 w-4" />
                        )}
                      </Button>
                    )}

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
                        {row.module.order != null
                          ? `Module ${row.module.order
                              .toString()
                              .padStart(2, "0")} · `
                          : ""}
                        {row.module.title}
                      </p>
                      {locked ? (
                        <p className="text-sm font-medium leading-snug text-muted-foreground">
                          {r.title}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={open}
                          className="text-left text-sm font-medium leading-snug text-foreground hover:text-accent transition-colors"
                        >
                          {r.title}
                        </button>
                      )}
                      {locked ? (
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
                          <Lock className="h-3 w-3" />
                          Not available to you
                        </p>
                      ) : (
                        <p className="font-mono text-xs text-muted-foreground mt-0.5">
                          {r.durationLabel}
                          {r.durationLabel && r.publishedAt ? " · " : ""}
                          {r.publishedAt
                            ? `published ${formatDate(r.publishedAt)}`
                            : ""}
                          {r.watched && (
                            <span className="ml-2 text-success font-sans">· Completed</span>
                          )}
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
                      className="shrink-0 self-center rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      aria-label="Open module"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                );
              })}
            </IndexList>
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
