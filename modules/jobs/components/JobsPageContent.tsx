"use client";
import { useMemo, useState } from "react";
import {
  Briefcase,
  Building2,
  ExternalLink,
  MapPin,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pager } from "@/components/ui/pager";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useJobCompanies, useJobs } from "../api/jobs.queries";
import type { Job } from "../types";

const PAGE_SIZE = 20;

type RemoteFilter = "all" | "remote" | "onsite";
type Scope = "mine" | "all";

const SCOPES: { value: Scope; label: string }[] = [
  { value: "mine", label: "For my courses" },
  { value: "all", label: "All openings" },
];

const REMOTE_FILTERS: { value: RemoteFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
];

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

  const { data, isLoading, isFetching, refetch } = useJobs({
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

  const jobs = useMemo(() => data?.jobs ?? [], [data]);
  const meta = data?.meta;
  const filtered = !!keyword || company !== "__all__" || remote !== "all";

  return (
    <div className="space-y-6">
      {/* Scope selector — segmented control */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
        {SCOPES.map((s) => {
          const on = scope === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => changeScope(s.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                on
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Filter row */}
      <div className="space-y-3">
         <div className="flex flex-wrap items-center gap-2">
           <RefreshButton loading={isFetching || companiesFetching} onClick={() => Promise.allSettled([refetch(), refetchCompanies()])} />
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={rawQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search role, company or location…"
              className="pl-8"
            />
          </div>

          <Select value={company} onValueChange={(v) => changeCompany(v ?? "__all__")}>
            <SelectTrigger className="w-40 shrink-0">
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

          {meta && (
            <span className="ml-auto text-xs text-muted-foreground">
              {meta.totalItems} opening{meta.totalItems === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {/* Remote pill filters */}
        <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {REMOTE_FILTERS.map((f) => {
            const on = remote === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => changeRemote(f.value)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  on
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            );
          })}
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

      {/* Empty state */}
      {!isLoading && jobs.length === 0 && (
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
        <Card
          className={cn(
            "rounded-2xl border border-border overflow-hidden transition-opacity shadow-sm p-0",
            isFetching && "opacity-60"
          )}
        >
          <ul className="divide-y divide-border">
            {jobs.map((job) => (
              <JobRow key={job._id} job={job} />
            ))}
          </ul>
        </Card>
      )}

      {meta && (
        <Pager
          page={meta.currentPage}
          totalPages={meta.totalPages}
          onPage={setPage}
          label={`${meta.totalItems} opening${meta.totalItems === 1 ? "" : "s"}`}
        />
      )}
    </div>
  );
}

function JobRow({ job }: { job: Job }) {
  return (
    <li>
      <a
        href={job.url}
        target="_blank"
        // The destination is an employer's own careers page, not ours —
        // noopener/noreferrer so it cannot reach back into this tab.
        rel="noopener noreferrer"
        className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/60 transition-colors"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {job.company}
          </p>
          <p className="text-sm font-medium leading-tight">{job.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {job.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </span>
            )}
            {job.isRemote && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                Remote
              </span>
            )}
            {job.salary && <span>{job.salary}</span>}
            <span>{postedLabel(job.postedAt)}</span>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
      </a>
    </li>
  );
}

function postedLabel(iso: string): string {
  const posted = new Date(iso);
  if (Number.isNaN(posted.getTime())) return "";
  const days = Math.floor((Date.now() - posted.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return posted.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
