import { apiClient } from "@/lib/api";
import { PROFILE_ENDPOINTS } from "../config/endpoints";
import type { AttendancePinRotation } from "../types";

class AttendancePinService {
  rotate(): Promise<AttendancePinRotation> {
    return apiClient.post<AttendancePinRotation>(
      PROFILE_ENDPOINTS.ATTENDANCE_PIN_ROTATE,
      {},
    );
  }
}

export const attendancePinService = new AttendancePinService();
