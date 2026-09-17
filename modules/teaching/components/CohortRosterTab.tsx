"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IndexList, IndexRow } from "@/components/ui/index-list";
import { useCohortRoster } from "../api/teaching.queries";
import { StudentAttendanceSheet } from "./StudentAttendanceSheet";
import type { CohortRosterRow } from "../types";

interface CohortRosterTabProps {
  scheduleId: string;
}

export function CohortRosterTab({ scheduleId }: CohortRosterTabProps) {
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: roster, isLoading } = useCohortRoster(scheduleId);

  const handleOpenAttendance = (row: CohortRosterRow) => {
    setSelectedStudent({ id: row.studentId, name: row.name });
    setSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      )}

      {!isLoading && roster && roster.length > 0 ? (
        <IndexList>
          {roster.map((row, idx) => (
            <IndexRow
              key={row.studentId}
              index={idx + 1}
              title={row.name}
              subtitle={row.email}
              status={
                <span className="text-[10px] font-mono">
                  {row.submissionCount} {row.submissionCount === 1 ? "sub" : "subs"}
                </span>
              }
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenAttendance(row)}
                  className="rounded-xl text-xs h-7 ml-auto"
                >
                  Attendance Record
                </Button>
              }
            />
          ))}
        </IndexList>
      ) : !isLoading ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-xs text-muted-foreground">
          No students enrolled in this cohort roster yet.
        </div>
      ) : null}

      <StudentAttendanceSheet
        scheduleId={scheduleId}
        studentId={selectedStudent?.id || null}
        studentName={selectedStudent?.name}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
