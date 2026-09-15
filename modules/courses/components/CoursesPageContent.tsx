"use client";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import { CourseCard } from "./CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, FilterDropdown } from "@/components/ui/filter-dropdown";
import { PageHeader } from "@/components/layout/page-header";
import { Stagger, StaggerItem } from "@/components/animation/stagger";
import { useCourses } from "../api/courses.queries";
import type { Course } from "../types";

type Filter = "all" | "in-progress" | "completed";

const STATUS_FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

const MODE_FILTERS = [
  { value: "all", label: "All" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "hybrid", label: "Hybrid" },
];

const COURSE_KIND_FILTERS = [
  { value: "all", label: "All" },
  { value: "full", label: "Full" },
  { value: "foundation", label: "Foundation" },
];

/** Student courses list. The instructor branch ("Your courses" with
 *  teaching cohorts) is deferred to Plan 011 — this slice renders the
 *  student body only. */
export function CoursesPageContent() {
  const [filter, setFilter] = useState<Filter>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const { data: courses, isLoading } = useCourses();

  const visible: Course[] = (courses || []).filter((c) => {
    const statusMatch =
      filter === "all"
        ? true
        : filter === "completed"
          ? c.status === "completed"
          : c.status === "in-progress";
    const modeMatch = modeFilter === "all" ? true : c.mode === modeFilter;
    const kindMatch =
      kindFilter === "all" ? true : c.courseKind === kindFilter;
    return statusMatch && modeMatch && kindMatch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your courses"
        description="Pick up where you left off, or jump into a new module."
      />

      <FilterBar>
        <FilterDropdown
          label="Status"
          options={STATUS_FILTERS}
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
        />
        <FilterDropdown
          label="Mode"
          options={MODE_FILTERS}
          value={modeFilter}
          onValueChange={setModeFilter}
        />
        <FilterDropdown
          label="Course kind"
          options={COURSE_KIND_FILTERS}
          value={kindFilter}
          onValueChange={setKindFilter}
        />
      </FilterBar>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
          <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
          <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && visible.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Nothing matches these filters"
          description="Try a different status, mode, or course kind."
        />
      )}

      {!isLoading && visible.length > 0 && (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <StaggerItem key={c.id}>
              <CourseCard course={c} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
