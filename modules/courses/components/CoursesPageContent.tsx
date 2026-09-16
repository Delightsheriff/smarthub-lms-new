"use client";
import { useState } from "react";
import { BookOpen, GraduationCap } from "lucide-react";
import { CourseCard } from "./CourseCard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, FilterDropdown } from "@/components/ui/filter-dropdown";
import { PageHeader } from "@/components/layout/page-header";
import { Stagger, StaggerItem } from "@/components/animation/stagger";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { useCourses } from "../api/courses.queries";
import { useTeachingCohorts } from "@/modules/teaching/api/teaching.queries";
import { CourseCard as TeachingCourseCard } from "@/modules/teaching/components/CourseCard";
import { groupCohortsByCourse, isCohortEnded } from "@/modules/teaching/lib/group-cohorts";
import type { Course } from "../types";

const TEACH_MODE_FILTERS = [
  { value: "all", label: "All modes" },
  { value: "online", label: "Online" },
  { value: "offline", label: "In-person" },
  { value: "hybrid", label: "Hybrid" },
];
const TEACH_PRIVACY_FILTERS = [
  { value: "all", label: "All" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];
const TEACH_STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "ended", label: "Ended" },
];

/** Instructor's "Courses" — one card per course, cohorts grouped
 *  inside (multi-cohort courses expand inline; courses with only
 *  ended cohorts dim below a divider). Narrows COHORTS first, then
 *  regroups the survivors, so "Private" shows a course card fronting
 *  only its private cohorts and a course with no match drops out
 *  entirely — matches legacy's InstructorCoursesBody filtering model. */
function InstructorCoursesBody() {
  const { data: cohorts, isLoading, error } = useTeachingCohorts();
  const [q, setQ] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [privacyFilter, setPrivacyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = (cohorts ?? []).filter((c) => {
    if (q.trim() && !c.course.name.toLowerCase().includes(q.trim().toLowerCase())) {
      return false;
    }
    const cohortMode = c.mode ?? c.course.mode;
    if (modeFilter !== "all" && cohortMode !== modeFilter) return false;
    if (privacyFilter === "private" && !c.isPrivate) return false;
    if (privacyFilter === "public" && c.isPrivate) return false;
    const ended = isCohortEnded(c.endDate);
    if (statusFilter === "active" && ended) return false;
    if (statusFilter === "ended" && !ended) return false;
    return true;
  });
  const grouped = groupCohortsByCourse(filtered);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Every cohort you teach, grouped by course."
      />

      <FilterBar>
        <div className="min-w-40 flex-1">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Search</p>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by course name…"
          />
        </div>
        <FilterDropdown label="Mode" options={TEACH_MODE_FILTERS} value={modeFilter} onValueChange={setModeFilter} />
        <FilterDropdown label="Privacy" options={TEACH_PRIVACY_FILTERS} value={privacyFilter} onValueChange={setPrivacyFilter} />
        <FilterDropdown label="Status" options={TEACH_STATUS_FILTERS} value={statusFilter} onValueChange={setStatusFilter} />
      </FilterBar>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      )}

      {error && (
        <Card className="p-6 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Couldn&apos;t load your cohorts. Try refreshing the page.
          </p>
        </Card>
      )}

      {!isLoading && !error && grouped.active.length === 0 && grouped.past.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title={cohorts?.length ? "Nothing matches these filters" : "No cohorts yet"}
          description={
            cohorts?.length
              ? "Try a different search, mode, privacy, or status."
              : "You're not on any active schedules. Reach out to admin to be added to a cohort."
          }
        />
      )}

      {!isLoading && grouped.active.length > 0 && (
        <div className="space-y-4">
          {grouped.active.map((g) => (
            <TeachingCourseCard key={g.courseId} group={g} />
          ))}
        </div>
      )}

      {!isLoading && grouped.past.length > 0 && (
        <>
          <div className="flex items-center gap-3 pt-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">Past cohorts</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-4 opacity-60">
            {grouped.past.map((g) => (
              <TeachingCourseCard key={g.courseId} group={g} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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

/** "Courses" — student browse grid, or the instructor's teaching-cohort
 *  view when in Teaching mode. Same nav label, mode-dependent content,
 *  same pattern as Home. */
export function CoursesPageContent() {
  const { mode } = useEffectiveMode();
  if (mode === "instructor") return <InstructorCoursesBody />;
  return <StudentCoursesBody />;
}

function StudentCoursesBody() {
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
    <div className="space-y-6 font-sans">
      <PageHeader
        variant="editorial"
        eyebrow="Learning"
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
