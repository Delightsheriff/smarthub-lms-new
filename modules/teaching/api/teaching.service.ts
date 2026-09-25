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
    patch: { dueDate?: string; isVisible?: boolean },
  ): Promise<{ success: boolean }> {
    return apiClient.patch<{ success: boolean }>(
      TEACHING_ENDPOINTS.ASSIGNMENT_SCHEDULE(assignmentId, scheduleId),
      patch,
    );
  }
}

export const teachingService = new TeachingService();
