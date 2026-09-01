"use client";

import React, { useState } from "react";
import { Users, Calendar, Award } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
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
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      )}

      {!isLoading && roster && roster.length > 0 ? (
        <div className="space-y-2.5">
          {roster.map((row) => {
            const initials = row.name
              .split(" ")
              .slice(0, 2)
              .map((s) => s[0])
              .join("")
              .toUpperCase();

            return (
              <Card key={row.studentId} className="rounded-2xl border bg-card p-4 shadow-xs">
                <CardContent className="p-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-0.5">
                      <span className="font-bold text-sm text-foreground block">{row.name}</span>
                      <span className="text-xs text-muted-foreground">{row.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="hidden sm:block text-right">
                      <span className="font-semibold text-foreground block">
                        {row.submissionCount} Submissions
                      </span>
                      <span className="text-[10px]">
                        Last: {row.lastSubmittedAt ? formatDate(row.lastSubmittedAt) : "Never"}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAttendance(row)}
                      className="rounded-xl text-xs"
                    >
                      Attendance Record
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : !isLoading ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-xs text-muted-foreground">
          No students enrolled in this cohort roster yet.
        </div>
      ) : null}

      <StudentAttendanceSheet
        studentId={selectedStudent?.id || null}
        studentName={selectedStudent?.name}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
