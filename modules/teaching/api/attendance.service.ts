import { apiClient } from "@/lib/api";
import { TEACHING_ENDPOINTS } from "../config/endpoints";
import type {
  SessionAttendanceResponse,
  MarkAttendancePayload,
  MarkAttendanceResult,
  StudentAttendanceHistory,
} from "../types/attendance";

class AttendanceService {
  async getSessionAttendance(sessionId: string): Promise<SessionAttendanceResponse> {
    return apiClient.get<SessionAttendanceResponse>(
      TEACHING_ENDPOINTS.ATTENDANCE_SESSION(sessionId),
    );
  }

  async markSessionAttendance(
    sessionId: string,
    payload: MarkAttendancePayload,
  ): Promise<MarkAttendanceResult> {
    return apiClient.patch<MarkAttendanceResult>(
      TEACHING_ENDPOINTS.MARK_ATTENDANCE(sessionId),
      payload,
    );
  }

  async getStudentAttendanceHistory(scheduleId: string, studentId: string): Promise<StudentAttendanceHistory> {
    return apiClient.get<StudentAttendanceHistory>(
      TEACHING_ENDPOINTS.STUDENT_ATTENDANCE(scheduleId, studentId),
    );
  }
}

export const attendanceService = new AttendanceService();
