import { apiClient, ApiResponse } from "@/lib/api";
import { SELF_PACED_ENDPOINTS } from "../config/endpoints";
import type {
  ApiLessonCompletion,
  ApiLessonDownload,
  ApiLessonPlayback,
  ApiNudge,
  ApiPassState,
  ApiSelfPacedCourseDetail,
  ApiSelfPacedCourseSummary,
  ApiUpgradeCredits,
} from "../types/api.types";

class SelfPacedService {
  async listCourses(): Promise<ApiSelfPacedCourseSummary[]> {
    const r = await apiClient.get<ApiResponse<ApiSelfPacedCourseSummary[]>>(
      SELF_PACED_ENDPOINTS.COURSES
    );
    return r.data ?? [];
  }

  async getCourse(slug: string): Promise<ApiSelfPacedCourseDetail> {
    const r = await apiClient.get<ApiResponse<ApiSelfPacedCourseDetail>>(
      SELF_PACED_ENDPOINTS.COURSE(slug)
    );
    return r.data;
  }

  async getPlayback(lessonId: string): Promise<ApiLessonPlayback> {
    const r = await apiClient.get<ApiResponse<ApiLessonPlayback>>(
      SELF_PACED_ENDPOINTS.PLAYBACK(lessonId)
    );
    return r.data;
  }

  // `silent`: the player owns the feedback for this toggle (optimistic
  // tick + its own error toast); the envelope message would double it.
  async markComplete(lessonId: string): Promise<ApiLessonCompletion> {
    const r = await apiClient.post<ApiResponse<ApiLessonCompletion>>(
      SELF_PACED_ENDPOINTS.COMPLETE(lessonId),
      undefined,
      { silent: true }
    );
    return r.data;
  }

  // `silent`: the download control shows every outcome inline (rate
  // limit, unavailable, processing); a toast on top would double it.
  async requestDownload(lessonId: string): Promise<ApiLessonDownload> {
    const r = await apiClient.post<ApiResponse<ApiLessonDownload>>(
      SELF_PACED_ENDPOINTS.DOWNLOAD(lessonId),
      undefined,
      { silent: true }
    );
    return r.data;
  }

  async listNudges(): Promise<ApiNudge[]> {
    const r = await apiClient.get<ApiResponse<ApiNudge[]>>(
      SELF_PACED_ENDPOINTS.NUDGES
    );
    return r.data ?? [];
  }

  // `silent`: the reminder just disappears; "Dismissed" as a toast is noise.
  async dismissNudge(id: string): Promise<void> {
    await apiClient.post<ApiResponse<unknown>>(
      SELF_PACED_ENDPOINTS.NUDGE_DISMISS(id),
      undefined,
      { silent: true }
    );
  }

  async getUpgradeCredits(): Promise<ApiUpgradeCredits> {
    const r = await apiClient.get<ApiResponse<ApiUpgradeCredits>>(
      SELF_PACED_ENDPOINTS.UPGRADE_CREDIT
    );
    return r.data ?? { windowDays: 0, credits: [] };
  }

  async getPass(): Promise<ApiPassState> {
    const r = await apiClient.get<ApiResponse<ApiPassState>>(
      SELF_PACED_ENDPOINTS.PASS
    );
    return r.data ?? { active: false, excludes: [] };
  }

  async unmarkComplete(lessonId: string): Promise<ApiLessonCompletion> {
    const r = await apiClient.delete<ApiResponse<ApiLessonCompletion>>(
      SELF_PACED_ENDPOINTS.COMPLETE(lessonId),
      { silent: true }
    );
    return r.data;
  }
}

export const selfPacedService = new SelfPacedService();
