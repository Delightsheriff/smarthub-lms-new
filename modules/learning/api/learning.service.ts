import { apiClient } from "@/lib/api";
import { LEARNING_ENDPOINTS } from "../config/endpoints";
import type {
  ApiAssignment,
  ApiContentProgress,
  ContentProgressType,
  ApiMaterial,
  ApiMaterialWithContext,
  ApiRecording,
  ApiRecordingWithContext,
} from "../types/api.types";

/**
 * Service for the module-content domain. Every method travels over the
 * data-source seam (`apiClient`), which resolves against the mock router
 * in the UI-first phase and the real adapter at Plan 012. The target
 * `apiClient` returns the raw record (no `ApiResponse` envelope), so the
 * unwrap step the source version did is gone.
 */
class LearningService {
  async getRecordingsByModule(moduleId: string): Promise<ApiRecording[]> {
    return apiClient.get<ApiRecording[]>(
      LEARNING_ENDPOINTS.RECORDINGS_BY_MODULE(moduleId),
    );
  }

  /** Cross-course "All recordings" feed — every visible recording
   *  across the student's enrolments, tagged with course + module. */
  async getMyRecordings(): Promise<ApiRecordingWithContext[]> {
    return apiClient.get<ApiRecordingWithContext[]>(
      LEARNING_ENDPOINTS.MY_RECORDINGS,
    );
  }

  /** Cross-course "All materials" feed. */
  async getMyMaterials(): Promise<ApiMaterialWithContext[]> {
    return apiClient.get<ApiMaterialWithContext[]>(
      LEARNING_ENDPOINTS.MY_MATERIALS,
    );
  }

  async trackRecordingView(recordingId: string): Promise<void> {
    await apiClient.patch(LEARNING_ENDPOINTS.RECORDING_VIEW(recordingId));
  }

  /** Completion rows for one course. */
  async getCourseProgress(courseId: string): Promise<ApiContentProgress[]> {
    return apiClient.get<ApiContentProgress[]>(LEARNING_ENDPOINTS.PROGRESS, {
      params: { courseId },
    });
  }

  /** Every completion row for the caller across all courses. */
  async getAllProgress(): Promise<ApiContentProgress[]> {
    return apiClient.get<ApiContentProgress[]>(LEARNING_ENDPOINTS.PROGRESS);
  }

  async markContentComplete(input: {
    courseId: string;
    contentType: ContentProgressType;
    contentId: string;
  }): Promise<void> {
    await apiClient.post(LEARNING_ENDPOINTS.PROGRESS, input);
  }

  async unmarkContentComplete(input: {
    contentType: ContentProgressType;
    contentId: string;
  }): Promise<void> {
    await apiClient.delete(LEARNING_ENDPOINTS.PROGRESS, { data: input });
  }

  async getMaterialsByModule(moduleId: string): Promise<ApiMaterial[]> {
    return apiClient.get<ApiMaterial[]>(
      LEARNING_ENDPOINTS.MATERIALS_BY_MODULE(moduleId),
    );
  }

  async trackMaterialDownload(materialId: string): Promise<void> {
    await apiClient.patch(LEARNING_ENDPOINTS.MATERIAL_DOWNLOAD(materialId));
  }

  async getAssignmentsByModule(moduleId: string): Promise<ApiAssignment[]> {
    return apiClient.get<ApiAssignment[]>(
      LEARNING_ENDPOINTS.ASSIGNMENTS_BY_MODULE(moduleId),
    );
  }
}

export const learningService = new LearningService();
