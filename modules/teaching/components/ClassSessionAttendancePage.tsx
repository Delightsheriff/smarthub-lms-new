"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import { useSessionAttendance, useMarkSessionAttendance } from "../api/attendance.queries";
import type { AttendanceStatus } from "../types/attendance";

import { PageHeader } from "@/components/layout/page-header";

interface ClassSessionAttendancePageProps {
  sessionId: string;
}

const ATTENDANCE_STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" },
];

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

  const session = sessionData?.session;
  const rows = sessionData?.rows || [];

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

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href={session ? `/teach/cohorts/${session.scheduleId}` : "/teach"}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cohort Workspace
        </Link>
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
          <PageHeader
            variant="editorial"
            eyebrow="Teaching · Session Attendance"
            title={session.title}
            dateline={session.startsAt ? formatDateTime(session.startsAt) : undefined}
            divider
            description={
              session.location
                ? `Location: ${session.location} · ${rows.length} enrolled student${rows.length === 1 ? "" : "s"}`
                : `Mark attendance and add notes for ${rows.length} enrolled student${rows.length === 1 ? "" : "s"}.`
            }
            actions={
              <Button
                onClick={handleSaveAll}
                disabled={markMutation.isPending}
                className="rounded-xl"
              >
                <Save className="mr-1.5 h-4 w-4" />
                {markMutation.isPending ? "Saving..." : "Save All Marks"}
              </Button>
            }
          />

          {/* Roster Marking Table */}
          <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display text-base font-semibold text-foreground">
                Student Attendance Roster
              </h3>
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
                          <SelectValue>
                            {(v: string) => ATTENDANCE_STATUS_OPTIONS.find((s) => s.value === v)?.label ?? v}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
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
