"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Award,
  CalendarClock,
  ClipboardList,
  Link2,
  MoreHorizontal,
  Pencil,
  Plus,
  Unlink,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Ledger, LedgerControlItem } from "@/components/ui/ledger";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, pluralize } from "@/lib/utils";
import {
  useCohortAssignments,
  useDetachFromSchedule,
  useTeachingCohortDetail,
} from "../api/teaching.queries";
import type { CohortAssignmentRow } from "../types";
import { AttachExistingAssignmentDialog } from "./AttachExistingAssignmentDialog";
import { CohortScheduleDialog, type CohortScheduleTarget } from "./CohortScheduleDialog";
import { ConfirmDialog } from "./authoring/authoring-kit";

interface CohortAssignmentsTabProps {
  scheduleId: string;
}

export function CohortAssignmentsTab({ scheduleId }: CohortAssignmentsTabProps) {
  const router = useRouter();
  const { data: assignments, isLoading, error, refetch } = useCohortAssignments(scheduleId);
  const cohort = useTeachingCohortDetail(scheduleId);
  const detach = useDetachFromSchedule(scheduleId);
  const [attachOpen, setAttachOpen] = useState(false);
  const [scheduling, setScheduling] = useState<CohortScheduleTarget | null>(null);
  const [detaching, setDetaching] = useState<CohortAssignmentRow | null>(null);

  // Rows carry the module id; show its title.
  const moduleTitle = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of cohort.data?.modules ?? []) map.set(m.id, m.title);
    return map;
  }, [cohort.data?.modules]);

  const base = `/teach/cohorts/${scheduleId}/assignments`;

  const onDetach = async () => {
    if (!detaching) return;
    try {
      await detach.mutateAsync({ kind: "assignment", id: detaching.assignmentId });
      toast.success("Removed from this cohort");
      setDetaching(null);
    } catch {
      // Toasted by the API client; keep the dialog open.
    }
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setAttachOpen(true)}>
        <Link2 className="h-3.5 w-3.5" aria-hidden />
        Attach existing
      </Button>
      <Button size="sm" nativeButton={false} render={<Link href={`${base}/new`} />}>
        <Plus className="h-3.5 w-3.5" aria-hidden />
        New assignment
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      )}

      {error && !isLoading && (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load assignments"
          description="There was a problem loading assignments for this cohort. Please try again."
          action={
            <Button type="button" variant="outline" onClick={() => refetch()} className="rounded-xl">
              Try again
            </Button>
          }
        />
      )}

      {!isLoading && !error && (
        <Ledger
          title="Assignments"
          count={assignments?.length ?? 0}
          actions={headerActions}
          empty={
            <span className="inline-flex flex-col items-center gap-2">
              <ClipboardList className="h-5 w-5" aria-hidden />
              No assignments on this cohort yet. Create one, or attach one already in a module.
            </span>
          }
        >
          {(assignments ?? []).map((asgn) => {
            const href = `${base}/${asgn.assignmentId}`;
            return (
              <LedgerControlItem
                key={asgn.attachmentId}
                icon={Award}
                iconClassName="bg-primary/10 text-primary"
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    <Link href={href} className="text-sm font-semibold text-foreground hover:text-primary">
                      {asgn.title}
                    </Link>
                    {asgn.module && moduleTitle.get(asgn.module) && (
                      <Badge variant="outline" className="text-[10px]">
                        {moduleTitle.get(asgn.module)}
                      </Badge>
                    )}
                  </span>
                }
                meta={
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span>Due {asgn.dueDate ? formatDate(asgn.dueDate) : "— not set"}</span>
                    <span aria-hidden>·</span>
                    <span>{pluralize(asgn.submissionCount, "submission")}</span>
                    {asgn.pendingCount > 0 && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="font-medium text-warning">
                          {asgn.pendingCount} to grade
                        </span>
                      </>
                    )}
                  </span>
                }
                actions={
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`More actions for ${asgn.title}`}
                          />
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onClick={() => router.push(href)}>
                          <ClipboardList />
                          Submissions and grading
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`${href}/edit`)}>
                          <Pencil />
                          Edit assignment
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setScheduling({
                              assignmentId: asgn.assignmentId,
                              title: asgn.title,
                              dueDate: asgn.dueDate,
                              allowLateSubmission: asgn.allowLateSubmission,
                            })
                          }
                        >
                          <CalendarClock />
                          Due date and late work
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDetaching(asgn)}>
                          <Unlink />
                          Remove from this cohort
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                }
              />
            );
          })}
        </Ledger>
      )}

      <AttachExistingAssignmentDialog
        scheduleId={scheduleId}
        open={attachOpen}
        onOpenChange={setAttachOpen}
        modules={cohort.data?.modules}
      />
      <CohortScheduleDialog
        scheduleId={scheduleId}
        target={scheduling}
        onOpenChange={(o) => !o && setScheduling(null)}
      />
      <ConfirmDialog
        open={!!detaching}
        onOpenChange={(o) => !o && setDetaching(null)}
        title="Remove from this cohort?"
        description={
          <>
            Students in this cohort stop seeing <strong>{detaching?.title}</strong>. Submissions
            are kept, and it stays in its module and in other cohorts. To bring it back, use
            &ldquo;Attach existing&rdquo;.
          </>
        }
        confirmLabel="Remove from cohort"
        pending={detach.isPending}
        onConfirm={onDetach}
      />
    </div>
  );
}
