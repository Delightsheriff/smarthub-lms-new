"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "./attendance.service";
import type { MarkAttendancePayload } from "../types/attendance";

export const ATTENDANCE_QUERY_KEYS = {
  session: (id: string) => ["teaching", "attendance", "session", id] as const,
  student: (id: string) => ["teaching", "attendance", "student", id] as const,
} as const;

export function useSessionAttendance(sessionId: string) {
  return useQuery({
    queryKey: ATTENDANCE_QUERY_KEYS.session(sessionId),
    enabled: !!sessionId,
    queryFn: () => attendanceService.getSessionAttendance(sessionId),
    refetchInterval: 30_000, // 30 second polling for live attendance
  });
}

export function useMarkSessionAttendance(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MarkAttendancePayload) =>
      attendanceService.markSessionAttendance(sessionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.session(sessionId) });
    },
  });
}

export function useStudentAttendanceHistory(studentId: string | null) {
  return useQuery({
    queryKey: ATTENDANCE_QUERY_KEYS.student(studentId || ""),
    enabled: !!studentId,
    queryFn: () => attendanceService.getStudentAttendanceHistory(studentId!),
  });
}
