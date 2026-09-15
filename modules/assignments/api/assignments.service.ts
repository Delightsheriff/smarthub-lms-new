import { apiClient } from "@/lib/api";
import {
  ASSIGNMENTS_ENDPOINTS,
  SUBMISSIONS_ENDPOINTS,
  UPLOAD_ENDPOINTS,
} from "../config/endpoints";
import type { ApiAssignment } from "@/modules/learning/types/api.types";
import type { ApiSubmission, ApiUploadResponse } from "../types/api.types";

/** One page big enough to hold every assignment a student will ever
 *  have. The endpoint caps nothing above this; it's a ceiling we choose
 *  so the list can't be silently cut off at the server's default of 10. */
const STUDENT_ASSIGNMENTS_PAGE_SIZE = 200;

class AssignmentsService {
  async getStudentAssignments(): Promise<ApiAssignment[]> {
    // 404 "Student record not found" is a legitimate response for an
    // instructor-only account (no Student doc) — a dashboard widget,
    // not a broken call. Silenced like the other self-gating widgets
    // (progress pulse, achievements); callers treat empty/error the same.
    return apiClient.get<ApiAssignment[]>(ASSIGNMENTS_ENDPOINTS.STUDENT, {
      params: { pageSize: STUDENT_ASSIGNMENTS_PAGE_SIZE },
      silent: true,
    });
  }

  async getUpcomingDeadlines(): Promise<ApiAssignment[]> {
    // Same "no Student record" case as getStudentAssignments above.
    return apiClient.get<ApiAssignment[]>(ASSIGNMENTS_ENDPOINTS.UPCOMING, {
      silent: true,
    });
  }

  async getAssignmentById(id: string): Promise<ApiAssignment> {
    return apiClient.get<ApiAssignment>(ASSIGNMENTS_ENDPOINTS.BY_ID(id));
  }

  async getMySubmissions(): Promise<ApiSubmission[]> {
    return apiClient.get<ApiSubmission[]>(SUBMISSIONS_ENDPOINTS.MY);
  }

  async getMySubmission(assignmentId: string): Promise<ApiSubmission | null> {
    return apiClient.get<ApiSubmission | null>(
      `${SUBMISSIONS_ENDPOINTS.CREATE}/${assignmentId}/mine`,
    );
  }

  async createSubmission(body: SubmissionPayload): Promise<ApiSubmission> {
    return apiClient.post<ApiSubmission>(SUBMISSIONS_ENDPOINTS.CREATE, body);
  }

  async resubmit(id: string, body: SubmissionPayload): Promise<ApiSubmission> {
    return apiClient.put<ApiSubmission>(
      SUBMISSIONS_ENDPOINTS.RESUBMIT(id),
      body,
    );
  }

  async uploadAssignmentFile(file: File): Promise<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileMimeType: string;
  }> {
    const form = new FormData();
    form.append("file", file);
    const r = await apiClient.post<ApiUploadResponse>(
      UPLOAD_ENDPOINTS.ASSIGNMENT_FILE,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return {
      fileUrl: r.url,
      fileName: r.fileName ?? file.name,
      fileSize: r.fileSize ?? file.size,
      fileMimeType: r.mimeType ?? file.type,
    };
  }
}

export interface SubmissionPayload {
  assignmentId: string;
  /** No longer sent — the API derives the course from the cohort. Kept
   *  optional so callers still compile. */
  courseId?: string;
  submissionType: "file" | "text" | "url";
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  externalUrl?: string;
  notes?: string;
}

export const assignmentsService = new AssignmentsService();
