import { LMS_PREFIX } from "@/lib/api/constants";

/**
 * Module-content endpoints. Recordings + materials own their own LMS
 * routes; assignments-by-module live on the assignments router.
 */
export const LEARNING_ENDPOINTS = {
  RECORDINGS_BY_MODULE: (moduleId: string) =>
    `${LMS_PREFIX}/recordings/module/${moduleId}`,
  MY_RECORDINGS: `${LMS_PREFIX}/recordings/me`,
  MY_MATERIALS: `${LMS_PREFIX}/materials/me`,
  RECORDING_VIEW: (recordingId: string) =>
    `${LMS_PREFIX}/recordings/${recordingId}/view`,
  MATERIALS_BY_MODULE: (moduleId: string) =>
    `${LMS_PREFIX}/materials/module/${moduleId}`,
  MATERIAL_DOWNLOAD: (materialId: string) =>
    `${LMS_PREFIX}/materials/${materialId}/download`,
  ASSIGNMENTS_BY_MODULE: (moduleId: string) =>
    `${LMS_PREFIX}/assignments/module/${moduleId}`,
} as const;
