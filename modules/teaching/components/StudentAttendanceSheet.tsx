"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { useStudentAttendanceHistory } from "../api/attendance.queries";

interface StudentAttendanceSheetProps {
  studentId: string | null;
  studentName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentAttendanceSheet({
  studentId,
  studentName,
  open,
  onOpenChange,
}: StudentAttendanceSheetProps) {
  const { data, isLoading } = useStudentAttendanceHistory(open ? studentId : null);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "present":
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950">Present</Badge>;
      case "late":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950">Late</Badge>;
      case "absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "excused":
        return <Badge variant="outline">Excused</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Unmarked</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Attendance Record — {studentName || data?.student.firstName || "Student"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Per-session attendance history and cumulative breakdown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isLoading && <Skeleton className="h-40 w-full rounded-xl" />}

          {!isLoading && data && data.cohorts.length > 0 ? (
            data.cohorts.map((block) => (
              <div key={block.scheduleId} className="space-y-3">
                {/* Summary Box */}
                <div className="p-3 rounded-xl border bg-muted/20 flex items-center justify-between text-xs font-semibold">
                  <span>Attendance Rate</span>
                  <Badge className="bg-primary text-primary-foreground font-bold">
                    {block.summary.percentage}%
                  </Badge>
                </div>

                {/* Session list */}
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-none pr-1">
                  {block.sessions.map((session) => (
                    <div
                      key={session.sessionId}
                      className="p-3 rounded-xl border bg-card flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground block">
                          {session.title || "Class Session"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDateTime(session.startsAt)}
                        </span>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : !isLoading ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No attendance records found for this student.
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
