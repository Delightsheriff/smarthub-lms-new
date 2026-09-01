"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Video, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import { useSessionAttendance, useMarkSessionAttendance } from "../api/attendance.queries";
import type { AttendanceStatus } from "../types/attendance";

interface ClassSessionAttendancePageProps {
  sessionId: string;
}

export function ClassSessionAttendancePage({ sessionId }: ClassSessionAttendancePageProps) {
  const { data: sessionData, isLoading, error } = useSessionAttendance(sessionId);
  const markMutation = useMarkSessionAttendance(sessionId);

  const [localOverrides, setLocalOverrides] = useState<Map<string, { status: AttendanceStatus; note?: string }>>(
    () => new Map(),
  );

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setLocalOverrides((prev) => {
      const next = new Map(prev);
      const existing = next.get(studentId) || { status: "absent" };
      next.set(studentId, { ...existing, status });
      return next;
    });
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setLocalOverrides((prev) => {
      const next = new Map(prev);
      const existing = next.get(studentId) || { status: "absent" };
      next.set(studentId, { ...existing, note });
      return next;
    });
  };

  const handleSaveAll = async () => {
    const marksArray = rows.map((row) => {
      const override = localOverrides.get(row.studentId);
      return {
        studentId: row.studentId,
        status: override?.status ?? row.status ?? "absent",
        note: override?.note ?? row.note,
      };
    });

    await markMutation.mutateAsync({ marks: marksArray });
  };

  const session = sessionData?.session;
  const rows = sessionData?.rows || [];

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      {/* Back Button */}
      <div>
        <Button
          render={<Link href={session ? `/teach/cohorts/${session.scheduleId}` : "/teach"} />}
          variant="ghost"
          size="sm"
          className="rounded-xl text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Cohort Workspace
        </Button>
      </div>

      {isLoading && <Skeleton className="h-44 w-full rounded-2xl" />}

      {error && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 text-center space-y-1">
          <p className="text-sm font-medium text-destructive">
            Failed to load session attendance.
          </p>
        </div>
      )}

      {!isLoading && session && (
        <>
          {/* Header Card */}
          <Card className="rounded-2xl border bg-card p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950">
                <Video className="mr-1 h-3.5 w-3.5" /> Class Session Attendance
              </Badge>
              {session.startsAt && (
                <span className="text-xs text-muted-foreground font-mono">
                  {formatDateTime(session.startsAt)}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-foreground">{session.title}</h1>
            {session.location && (
              <p className="text-xs text-muted-foreground">Location: {session.location}</p>
            )}
          </Card>

          {/* Roster Marking Table */}
          <Card className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-base font-bold text-foreground">
                Student Attendance ({rows.length} Enrolled)
              </h3>
              <Button
                onClick={handleSaveAll}
                disabled={markMutation.isPending}
                className="rounded-xl"
              >
                <Save className="mr-1.5 h-4 w-4" />
                {markMutation.isPending ? "Saving..." : "Save All Marks"}
              </Button>
            </div>

            <div className="space-y-3">
              {rows.map((row) => {
                const override = localOverrides.get(row.studentId);
                const markStatus = override?.status ?? row.status ?? "absent";
                const markNote = override?.note ?? row.note ?? "";

                return (
                  <div
                    key={row.studentId}
                    className="p-3.5 rounded-xl border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-foreground block text-sm">
                        {row.firstName} {row.lastName}
                      </span>
                      <span className="text-muted-foreground">{row.email}</span>
                      {row.source && (
                        <div className="pt-0.5">
                          <Badge variant="outline" className="text-[10px]">
                            Source: {row.source}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      {/* Status Selector */}
                      <Select
                        value={markStatus}
                        onValueChange={(v) => handleStatusChange(row.studentId, v as AttendanceStatus)}
                      >
                        <SelectTrigger className="w-32 rounded-xl text-xs bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="excused">Excused</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Note Input */}
                      <Textarea
                        value={markNote}
                        onChange={(e) => handleNoteChange(row.studentId, e.target.value)}
                        placeholder="Optional note..."
                        rows={1}
                        className="w-full sm:w-48 rounded-xl text-xs resize-none py-1.5"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
