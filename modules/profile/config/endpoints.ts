import { LMS_PREFIX } from "@/lib/api/constants";

export const PROFILE_ENDPOINTS = {
  UPDATE_DETAILS: `${LMS_PREFIX}/profile/details`,
  UPDATE_PROFESSIONAL: `${LMS_PREFIX}/profile/professional`,
  BANKING: `${LMS_PREFIX}/profile/banking`,
  ATTENDANCE_PIN_ROTATE: `${LMS_PREFIX}/me/attendance-pin/rotate`,
} as const;
