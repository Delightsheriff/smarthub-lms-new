import { apiClient } from "@/lib/api";
import { triggerBlobDownload } from "@/lib/cloudinary-download";
import { COURSES_ENDPOINTS } from "../config/endpoints";
import type {
  ApiEnrolledCourse,
  ApiEnrolledCourseDetails,
  ApiModule,
} from "../types/api.types";

class CoursesService {
  async getEnrolled(): Promise<ApiEnrolledCourse[]> {
    return apiClient.get<ApiEnrolledCourse[]>(COURSES_ENDPOINTS.ENROLLED);
  }

  async getEnrolledDetail(slug: string): Promise<ApiEnrolledCourseDetails> {
    return apiClient.get<ApiEnrolledCourseDetails>(
      COURSES_ENDPOINTS.ENROLLED_DETAIL(slug),
    );
  }

  /**
   * The curriculum PDF is rendered per request from live course data.
   * The bytes come back on an authenticated call and are saved straight
   * to disk. The mock adapter currently resolves `getBlob` to an empty
   * Blob, so this is a no-op until the real upload stream lands.
   */
  async downloadCurriculum(slug: string): Promise<void> {
    const blob = await apiClient.getBlob(
      COURSES_ENDPOINTS.CURRICULUM_PDF(slug),
    );
    triggerBlobDownload(blob, `${slug}-curriculum.pdf`);
  }

  async getModulesByCourse(courseId: string): Promise<ApiModule[]> {
    return apiClient.get<ApiModule[]>(
      COURSES_ENDPOINTS.MODULES_BY_COURSE(courseId),
    );
  }
}

export const coursesService = new CoursesService();
