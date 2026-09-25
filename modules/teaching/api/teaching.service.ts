import { apiClient } from "@/lib/api";
import { TEACHING_ENDPOINTS } from "../config/endpoints";
import type {
  ApiCohortSubmissionRow,
  ApiInboxRow,
  ApiTeachingCohort,
  ApiTeachingCohortDetail,
} from "../types/api.types";
import { normaliseCohortSubmissionRow } from "./normalise";
import type {
  CohortRosterRow,
  CohortAssignmentRow,
  CohortSubmissionRow,
  InstructorAssignmentRow,
  CohortStudentAssignments,
  CohortRecordingRow,
  CohortSlackStatus,
  ApiAssignmentDetail,
  ApiInstructorModule,
  ApiMaterialDetail,
  ApiModuleAssignmentRow,
  ApiRecordingDetail,
  AttachAssignmentToSchedulePayload,
  CreateAssignmentPayload,
  CreateMaterialPayload,
  CreateRecordingPayload,
  UpdateAssignmentPayload,
  UpdateAssignmentSchedulePayload,
  UpdateMaterialPayload,
  UpdateRecordingPayload,
} from "../types";

class TeachingService {
  async getCohorts(): Promise<ApiTeachingCohort[]> {
    return apiClient.get<ApiTeachingCohort[]>(TEACHING_ENDPOINTS.COHORTS);
  }

  /** Aggregate submissions feed across every cohort the caller teaches.
   *  `status: "ungraded"` (default) powers Needs-grading; `"all"` powers
   *  Recent submissions — one endpoint, two dashboard tiles. */
  async getInbox(
    limit = 20,
    status: "ungraded" | "all" = "ungraded",
  ): Promise<ApiInboxRow[]> {
    return apiClient.get<ApiInboxRow[]>(TEACHING_ENDPOINTS.INBOX, {
      params: { limit, status },
    });
  }

  async getCohortDetail(id: string): Promise<ApiTeachingCohortDetail> {
    return apiClient.get<ApiTeachingCohortDetail>(TEACHING_ENDPOINTS.COHORT_DETAIL(id));
  }

  async getRoster(id: string): Promise<CohortRosterRow[]> {
    return apiClient.get<CohortRosterRow[]>(TEACHING_ENDPOINTS.ROSTER(id));
  }

  async getAssignments(id: string): Promise<CohortAssignmentRow[]> {
    return apiClient.get<CohortAssignmentRow[]>(TEACHING_ENDPOINTS.ASSIGNMENTS(id));
  }

  async getCohortStudentAssignments(
    scheduleId: string,
    studentId: string,
  ): Promise<CohortStudentAssignments> {
    return apiClient.get<CohortStudentAssignments>(
      TEACHING_ENDPOINTS.COHORT_STUDENT_ASSIGNMENTS(scheduleId, studentId),
    );
  }

  /** Every assignment across every cohort the caller teaches, with
   *  submission rollups — powers the instructor Tasks list. */
  async getMyAssignments(): Promise<InstructorAssignmentRow[]> {
    return apiClient.get<InstructorAssignmentRow[]>(TEACHING_ENDPOINTS.MY_ASSIGNMENTS);
  }

  /** The wire rows carry Mongo `_id`s; normalised here so every caller
   *  gets `id` (grading posts to `/submissions/:id/grade`). */
  async getSubmissions(id: string): Promise<CohortSubmissionRow[]> {
    const rows = await apiClient.get<ApiCohortSubmissionRow[]>(
      TEACHING_ENDPOINTS.SUBMISSIONS(id),
    );
    return (rows || []).map(normaliseCohortSubmissionRow);
  }

  async gradeSubmission(
    submissionId: string,
    score: number,
    feedback?: string,
  ): Promise<{ success: boolean }> {
    return apiClient.patch<{ success: boolean }>(
      TEACHING_ENDPOINTS.GRADE_SUBMISSION(submissionId),
      { score, generalFeedback: feedback },
    );
  }

  async updateAssignmentSchedule(
    assignmentId: string,
    scheduleId: string,
    patch: UpdateAssignmentSchedulePayload,
  ): Promise<{ success: boolean }> {
    return apiClient.patch<{ success: boolean }>(
      TEACHING_ENDPOINTS.ASSIGNMENT_SCHEDULE(assignmentId, scheduleId),
      patch,
    );
  }

  // ─── Authoring: assignments ──────────────────────────────────────

  async getAssignmentDetail(id: string): Promise<ApiAssignmentDetail> {
    return apiClient.get<ApiAssignmentDetail>(
      TEACHING_ENDPOINTS.ASSIGNMENT_BY_ID(id),
    );
  }

  async createAssignment(
    payload: CreateAssignmentPayload,
  ): Promise<{ _id: string }> {
    return apiClient.post<{ _id: string }>(
      TEACHING_ENDPOINTS.ASSIGNMENTS_BASE,
      payload,
    );
  }

  async updateAssignment(
    id: string,
    payload: UpdateAssignmentPayload,
  ): Promise<unknown> {
    return apiClient.patch(TEACHING_ENDPOINTS.ASSIGNMENT_BY_ID(id), payload);
  }

  async attachAssignmentToSchedule(
    assignmentId: string,
    scheduleId: string,
    payload: AttachAssignmentToSchedulePayload,
  ): Promise<void> {
    await apiClient.post(
      TEACHING_ENDPOINTS.ASSIGNMENT_SCHEDULE(assignmentId, scheduleId),
      payload,
    );
  }

  async detachAssignmentFromSchedule(
    assignmentId: string,
    scheduleId: string,
  ): Promise<void> {
    await apiClient.delete(
      TEACHING_ENDPOINTS.ASSIGNMENT_SCHEDULE(assignmentId, scheduleId),
    );
  }

  async getModuleAssignments(
    moduleId: string,
  ): Promise<ApiModuleAssignmentRow[]> {
    const rows = await apiClient.get<ApiModuleAssignmentRow[]>(
      TEACHING_ENDPOINTS.MODULE_ASSIGNMENTS(moduleId),
    );
    return rows || [];
  }

  async getMyModules(): Promise<ApiInstructorModule[]> {
    const rows = await apiClient.get<ApiInstructorModule[]>(
      TEACHING_ENDPOINTS.MY_MODULES,
    );
    return rows || [];
  }

  async getCohortSlackStatus(scheduleId: string): Promise<CohortSlackStatus> {
    const r = await apiClient.get<CohortSlackStatus>(
      TEACHING_ENDPOINTS.COHORT_SLACK_STATUS(scheduleId),
      { silent: true },
    );
    return r || { connected: false };
  }

  // ─── Authoring: recordings ───────────────────────────────────────

  async getRecordingDetail(id: string): Promise<ApiRecordingDetail> {
    return apiClient.get<ApiRecordingDetail>(
      TEACHING_ENDPOINTS.RECORDING_BY_ID(id),
    );
  }

  async createRecording(
    payload: CreateRecordingPayload,
  ): Promise<{ _id: string }> {
    return apiClient.post<{ _id: string }>(
      TEACHING_ENDPOINTS.RECORDINGS_BASE,
      payload,
    );
  }

  /** The API uses PUT for recording updates (recordings.lms.routes.ts). */
  async updateRecording(
    id: string,
    payload: UpdateRecordingPayload,
  ): Promise<unknown> {
    return apiClient.put(TEACHING_ENDPOINTS.RECORDING_BY_ID(id), payload);
  }

  async getModuleRecordings(moduleId: string): Promise<ApiRecordingDetail[]> {
    const rows = await apiClient.get<ApiRecordingDetail[]>(
      TEACHING_ENDPOINTS.RECORDINGS_BY_MODULE(moduleId),
    );
    return rows || [];
  }

  async getCohortRecordings(scheduleId: string): Promise<CohortRecordingRow[]> {
    const rows = await apiClient.get<CohortRecordingRow[]>(
      TEACHING_ENDPOINTS.COHORT_RECORDINGS(scheduleId),
    );
    return rows || [];
  }

  async attachRecordingToSchedule(
    recordingId: string,
    scheduleId: string,
  ): Promise<void> {
    await apiClient.post(
      TEACHING_ENDPOINTS.RECORDING_TO_SCHEDULE(recordingId, scheduleId),
      {},
    );
  }

  /** Detach hides the recording from this cohort; re-attach flips it back. */
  async detachRecordingFromSchedule(
    recordingId: string,
    scheduleId: string,
  ): Promise<void> {
    await apiClient.delete(
      TEACHING_ENDPOINTS.RECORDING_TO_SCHEDULE(recordingId, scheduleId),
    );
  }

  /** Deletes the canonical recording — gone from EVERY cohort. */
  async deleteRecording(id: string): Promise<void> {
    await apiClient.delete(TEACHING_ENDPOINTS.RECORDING_BY_ID(id));
  }

  // ─── Authoring: materials ────────────────────────────────────────

  /** Deletes the canonical material — gone from EVERY cohort. */
  async deleteMaterial(id: string): Promise<void> {
    await apiClient.delete(TEACHING_ENDPOINTS.MATERIAL_BY_ID(id));
  }

  async getMaterialDetail(id: string): Promise<ApiMaterialDetail> {
    return apiClient.get<ApiMaterialDetail>(
      TEACHING_ENDPOINTS.MATERIAL_BY_ID(id),
    );
  }

  async createMaterial(
    payload: CreateMaterialPayload,
  ): Promise<{ _id: string }> {
    return apiClient.post<{ _id: string }>(
      TEACHING_ENDPOINTS.MATERIALS_BASE,
      payload,
    );
  }

  /** PUT, and the API re-runs the CREATE validator on it — send the full
   *  material, not a partial patch. */
  async updateMaterial(
    id: string,
    payload: UpdateMaterialPayload,
  ): Promise<unknown> {
    return apiClient.put(TEACHING_ENDPOINTS.MATERIAL_BY_ID(id), payload);
  }
}

export const teachingService = new TeachingService();
