"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ledger, LedgerControlItem } from "@/components/ui/ledger";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, pluralize } from "@/lib/utils";
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
                ? `Location: ${session.location} · ${pluralize(rows.length, "enrolled student")}`
                : `Mark attendance and add notes for ${pluralize(rows.length, "enrolled student")}.`
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

          {/* Roster Marking Ledger */}
          <Ledger title="Student Attendance Roster" count={rows.length}>
            {rows.map((row) => {
              const override = localOverrides.get(row.studentId);
              const markStatus = override?.status ?? row.status ?? "absent";
              const markNote = override?.note ?? row.note ?? "";

              const toneByStatus: Record<AttendanceStatus, "live" | "due" | "info"> = {
                present: "live",
                late: "due",
                absent: "info",
                excused: "info",
              };

              return (
                <LedgerControlItem
                  key={row.studentId}
                  tone={toneByStatus[markStatus]}
                  title={
                    <span className="font-semibold text-foreground">
                      {row.firstName} {row.lastName}
                    </span>
                  }
                  meta={
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{row.email}</span>
                      {row.source && (
                        <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-[0.05em] py-0 px-1.5 h-4">
                          Source: {row.source}
                        </Badge>
                      )}
                    </div>
                  }
                  actions={
                    <div className="flex w-full sm:w-auto items-center gap-2">
                      {/* Status Selector */}
                      <Select
                        value={markStatus}
                        onValueChange={(v) => handleStatusChange(row.studentId, v as AttendanceStatus)}
                      >
                        <SelectTrigger className="w-28 sm:w-32 rounded-xl text-xs bg-background">
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
                        className="flex-1 sm:w-48 rounded-xl text-xs resize-none py-1.5"
                      />
                    </div>
                  }
                />
              );
            })}
          </Ledger>
        </>
      )}
    </div>
  );
}
