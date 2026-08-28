"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { learningService } from "./learning.service";
import {
  normaliseRecording,
  normaliseMaterial,
  normaliseRecordingWithContext,
  normaliseMaterialWithContext,
} from "./normalise";

/** Fire-and-forget tracking pings used by the recording dialog and
 *  the materials list. Real implementations live behind PATCH /lms/...
 *  endpoints; the mutations here are thin wrappers so the calling
 *  component code stays unchanged. */
export function useTrackRecordingView() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recordingId: string) =>
      learningService.trackRecordingView(recordingId),
    // Flipping `watched` must refresh the course detail / module data so
    // the outline tick and the recordings "Watched" filter re-render.
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useTrackMaterialDownload() {
  return useMutation({
    mutationFn: (materialId: string) =>
      learningService.trackMaterialDownload(materialId),
    onError: () => toast.error("Couldn't record the download."),
  });
}

/** Recordings filed under a single module. Used by the instructor
 *  cohort module-detail page to list what's been published. The
 *  endpoint is course-scoped (returns every recording for the module
 *  regardless of cohort) which is fine for tutors managing content. */
export function useRecordingsByModule(moduleId: string | undefined) {
  return useQuery({
    queryKey: ["learning", "recordings", "by-module", moduleId] as const,
    queryFn: async () => {
      const rows = await learningService.getRecordingsByModule(
        moduleId as string,
      );
      return rows.map(normaliseRecording);
    },
    enabled: !!moduleId,
  });
}

export function useMaterialsByModule(moduleId: string | undefined) {
  return useQuery({
    queryKey: ["learning", "materials", "by-module", moduleId] as const,
    queryFn: async () => {
      const rows = await learningService.getMaterialsByModule(
        moduleId as string,
      );
      return rows.map(normaliseMaterial);
    },
    enabled: !!moduleId,
  });
}

/** Cross-course "All recordings" feed — every visible recording across
 *  the student's enrolments, tagged with course + module context.
 *  Backs the /recordings sidebar route. */
export function useMyRecordings() {
  return useQuery({
    queryKey: ["learning", "recordings", "mine"] as const,
    queryFn: async () => {
      const rows = await learningService.getMyRecordings();
      return rows.map(normaliseRecordingWithContext);
    },
  });
}

/** Cross-course "All materials" feed. Backs the /materials route. */
export function useMyMaterials() {
  return useQuery({
    queryKey: ["learning", "materials", "mine"] as const,
    queryFn: async () => {
      const rows = await learningService.getMyMaterials();
      return rows.map(normaliseMaterialWithContext);
    },
  });
}
