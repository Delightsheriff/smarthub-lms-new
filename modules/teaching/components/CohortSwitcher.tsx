"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, Check, ChevronsUpDown, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatDate } from "@/lib/utils";
import { useTeachingCohorts } from "../api/teaching.queries";
import { isCohortEnded } from "../lib/group-cohorts";

/**
 * Jump between the caller's cohorts of the same course without going
 * back to the Teaching dashboard. Keeps the current tab when switching.
 * Renders nothing when there's only one cohort to switch between.
 */
export function CohortSwitcher({
  scheduleId,
  courseId,
}: {
  scheduleId: string;
  courseId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: cohorts } = useTeachingCohorts();

  const siblings = (cohorts ?? [])
    .filter((c) => c.course.id === courseId)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  if (siblings.length < 2) return null;
  const current = siblings.find((c) => c.id === scheduleId);

  const go = (id: string) => {
    if (id === scheduleId) return;
    // Only the cohort root keeps its tab; deeper pages (a module, an
    // assignment) don't exist on the other cohort under the same ids.
    const tab = searchParams.get("tab");
    const onRoot = pathname === `/teach/cohorts/${scheduleId}`;
    router.push(`/teach/cohorts/${id}${onRoot && tab ? `?tab=${tab}` : ""}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="gap-2 text-xs" />}
      >
        <Calendar className="h-3.5 w-3.5" aria-hidden />
        <span className="max-w-[10rem] truncate">
          {current ? `Started ${formatDate(current.startDate)}` : "Switch cohort"}
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Your cohorts of this course</DropdownMenuLabel>
          {siblings.map((c) => {
            const active = c.id === scheduleId;
            const ended = isCohortEnded(c.endDate);
            return (
              <DropdownMenuItem
                key={c.id}
                onClick={() => go(c.id)}
                className="flex items-center justify-between gap-2"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Check
                    className={cn("h-3.5 w-3.5 shrink-0", active ? "opacity-100" : "opacity-0")}
                    aria-hidden
                  />
                  {formatDate(c.startDate)}
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" aria-hidden />
                    {c.studentCount}
                  </span>
                </span>
                <Badge variant={ended ? "outline" : "secondary"} className="shrink-0 text-[10px]">
                  {ended ? "Ended" : "Active"}
                </Badge>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
