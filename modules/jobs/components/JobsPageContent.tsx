"use client";
import { useState } from "react";
import {
  AlertCircle,
  Briefcase,
  RotateCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pager } from "@/components/ui/pager";
import { IndexList, IndexRow } from "@/components/ui/index-list";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, pluralize } from "@/lib/utils";
import { RefreshButton } from "@/components/ui/refresh-button";
import { PageHeader } from "@/components/layout/page-header";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useJobCompanies, useJobs } from "../api/jobs.queries";

const PAGE_SIZE = 20;

type RemoteFilter = "all" | "remote" | "onsite";
type Scope = "mine" | "all";

const SCOPES: { value: Scope; label: string }[] = [
  { value: "mine", label: "For my courses" },
  { value: "all", label: "All openings" },
];

const REMOTE_FILTERS: { value: RemoteFilter; label: string }[] = [
  { value: "all", label: "Remote & on-site" },
  { value: "remote", label: "Remote only" },
  { value: "onsite", label: "On-site only" },
];

const remoteLabel = (v: string) =>
  REMOTE_FILTERS.find((f) => f.value === v)?.label ?? "Remote & on-site";

/**
 * Student job board.
 *
 * Filtering is server-side, unlike the materials and recordings pages:
 * those hold a course's worth of rows in memory; this one is fed by a
 * daily crawl across every tracked employer and is already in the
 * hundreds. Paging in the browser would mean shipping all of it.
 */
export function JobsPageContent() {
  const [rawQuery, setRawQuery] = useState("");
  const keyword = useDebouncedValue(rawQuery.trim(), 300);
  const [company, setCompany] = useState("__all__");
  const [remote, setRemote] = useState<RemoteFilter>("all");
  // Defaults to the student's own courses. A board of every opening is
  // what any job site already gives them; matching is the point.
  const [scope, setScope] = useState<Scope>("mine");
  const [page, setPage] = useState(1);

  // Wrapper setters reset to page 1 inline so no effect is needed.
  const handleQueryChange = (v: string) => { setRawQuery(v); setPage(1); };
  const changeCompany = (v: string) => { setCompany(v); setPage(1); };
  const changeRemote = (v: RemoteFilter) => { setRemote(v); setPage(1); };
  const changeScope = (v: Scope) => { setScope(v); setPage(1); };

  const { data, isLoading, isError, isFetching, refetch } = useJobs({
    page,
    pageSize: PAGE_SIZE,
    keyword: keyword || undefined,
    company: company === "__all__" ? undefined : company,
    remote: remote === "all" ? undefined : remote === "remote",
    scope,
  });
  const {
    data: companies,
    isLoading: companiesLoading,
    isFetching: companiesFetching,
    refetch: refetchCompanies,
  } = useJobCompanies();

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const jobs = data?.jobs ?? [];
  // keepPreviousData holds the last page through a failed refetch; only
  // show the error when there's nothing to show instead.
  const failed = isError && !data;
  const meta = data?.meta;
  const filtered = !!keyword || company !== "__all__" || remote !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        divider
        dateline={`${dateline} · Career Opportunities`}
        title="Jobs & Openings"
        description={
          !isLoading && meta ? (
            <>
              <strong className="text-foreground">{meta.totalItems}</strong> openings{" "}
              {scope === "mine" ? "matched to your enrolled courses" : "across all tracked employers"}
              {" · "}
              Updated daily from career portals.
            </>
          ) : (
            "Openings matched to the courses you're taking, pulled daily from employer career sites."
          )
        }
        actions={
          <RefreshButton
            loading={isFetching || companiesFetching}
            onClick={() => Promise.allSettled([refetch(), refetchCompanies()])}
          />
        }
      />

      {/* Scope selector and count summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SegmentedControl
          items={SCOPES}
          value={scope}
          onChange={changeScope}
          layoutId="jobs-scope-pill"
          ariaLabel="Which openings to show"
          className="w-fit"
        />

        {meta && (
          <span className="text-xs text-muted-foreground">
            Showing <strong className="text-foreground">{jobs.length}</strong> of{" "}
            <strong className="text-foreground">{meta.totalItems}</strong> {pluralize(meta.totalItems, "opening", undefined, false)}
          </span>
        )}
      </div>

      {/* Filter row: search, company, remote pills */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={rawQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search role, company or location…"
            aria-label="Search jobs by role, company or location"
            className="pl-9 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={company} onValueChange={(v) => changeCompany(v ?? "__all__")}>
            <SelectTrigger
              aria-label="Company"
              className="w-44 rounded-xl shrink-0 *:data-[slot=select-value]:normal-case"
            >
              <SelectValue placeholder="All companies">
                {(v: string) => (v === "__all__" || !v ? "All companies" : v)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All companies</SelectItem>
              {companiesLoading ? (
                <SelectItem value="__loading__" disabled>
                  Loading companies…
                </SelectItem>
              ) : (
                (companies ?? []).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Select value={remote} onValueChange={(v) => changeRemote((v as RemoteFilter | null) ?? "all")}>
            <SelectTrigger
              aria-label="Work arrangement"
              className="w-44 rounded-xl shrink-0 *:data-[slot=select-value]:normal-case"
            >
              <SelectValue>{(v: string) => remoteLabel(v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {REMOTE_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      )}

      {/* Error state — before empty, so a failed fetch never reads as
          "no openings". */}
      {!isLoading && failed && (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load openings"
          description="Check your connection and try again."
          action={
            <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
              <RotateCw className="h-3.5 w-3.5" /> Try again
            </Button>
          }
        />
      )}

      {/* Empty state */}
      {!isLoading && !failed && jobs.length === 0 && (
        <Card className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
          <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-display font-semibold">No openings</p>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered
              ? "Nothing matches those filters. Try widening the search."
              : scope === "mine"
                ? "Nothing matched to your courses yet. Switch to All openings to browse everything we track."
                : "New roles arrive every morning — check back tomorrow."}
          </p>
        </Card>
      )}

      {/* Job list */}
      {!isLoading && jobs.length > 0 && (
        <div className={cn("transition-opacity", isFetching && "opacity-60")}>
          <IndexList>
            {jobs.map((job, idx) => (
              <IndexRow
                key={job._id}
                index={(page - 1) * PAGE_SIZE + idx + 1}
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                title={job.title}
                subtitle={[
                  job.company,
                  job.location,
                  job.salary,
                  postedLabel(job.postedAt),
                ]
                  .filter(Boolean)
                  .join(" · ")}
                status={job.isRemote ? "Remote" : "On-site"}
              />
            ))}
          </IndexList>
        </div>
      )}

      {meta && (
        <Pager
          page={meta.currentPage}
          totalPages={meta.totalPages}
          onPage={setPage}
          label={pluralize(meta.totalItems, "opening")}
        />
      )}
    </div>
  );
}

function postedLabel(iso: string): string {
  const posted = new Date(iso);
  if (Number.isNaN(posted.getTime())) return "";
  const days = Math.floor((Date.now() - posted.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return posted.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
