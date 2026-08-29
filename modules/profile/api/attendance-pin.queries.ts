"use client";
import { useMutation } from "@tanstack/react-query";
import { attendancePinService } from "./attendance-pin.service";
import type { AttendancePinRotation } from "../types";

export function useRotateAttendancePin() {
  return useMutation<AttendancePinRotation, Error, void>({
    mutationFn: () => attendancePinService.rotate(),
  });
}
