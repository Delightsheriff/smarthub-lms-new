"use client";
import { useState } from "react";
import { CourseCard } from "./CourseCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCourses } from "../api/courses.queries";
import { ChevronDown } from "lucide-react";
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

interface CourseFilterDropdownProps {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
}

function CourseFilterDropdown({
  label,
  options,
  value,
  onValueChange,
}: CourseFilterDropdownProps) {
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? "All";

  return (
    <div className="min-w-40">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">
        {label}
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between bg-background font-medium"
            >
              <span className="truncate">{selectedLabel}</span>
              <ChevronDown className="text-muted-foreground" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="min-w-40">
          <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

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
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Your courses</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pick up where you left off, or jump into a new module.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
        <CourseFilterDropdown
          label="Status"
          options={STATUS_FILTERS}
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
        />
        <CourseFilterDropdown
          label="Mode"
          options={MODE_FILTERS}
          value={modeFilter}
          onValueChange={setModeFilter}
        />
        <CourseFilterDropdown
          label="Course kind"
          options={COURSE_KIND_FILTERS}
          value={kindFilter}
          onValueChange={setKindFilter}
        />
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
          <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
          <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && visible.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Nothing here yet.
        </p>
      )}

      {!isLoading && visible.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
