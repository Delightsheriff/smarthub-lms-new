import { apiClient, ApiResponse } from "@/lib/api";
import { SELF_PACED_ENDPOINTS } from "../config/endpoints";
import type {
  AttributedOrder,
  InstructorLink,
  InstructorListMeta,
  MyInstructorLinks,
  MySelfPacedEarnings,
  Paged,
} from "../types/instructor.types";

const toMeta = (
  meta: { total?: number; page?: number; limit?: number } | undefined,
  fallbackLimit: number
): InstructorListMeta => ({
  total: meta?.total ?? 0,
  page: meta?.page ?? 1,
  limit: meta?.limit ?? fallbackLimit,
});

class SelfPacedInstructorService {
  async getLinks(): Promise<MyInstructorLinks> {
    const r = await apiClient.get<ApiResponse<MyInstructorLinks>>(
      SELF_PACED_ENDPOINTS.INSTRUCTOR_LINKS
    );
    return {
      links: r.data?.links ?? [],
      coursesWithoutLink: r.data?.coursesWithoutLink ?? [],
    };
  }

  // `silent`: the panel toasts what happened in its own words; the
  // envelope message ("Referral link issued") would double it.
  async issueLink(courseId: string): Promise<InstructorLink> {
    const r = await apiClient.post<ApiResponse<InstructorLink>>(
      SELF_PACED_ENDPOINTS.INSTRUCTOR_LINKS,
      { courseId },
      { silent: true }
    );
    return r.data;
  }

  async revokeLink(linkId: string): Promise<InstructorLink> {
    const r = await apiClient.post<ApiResponse<InstructorLink>>(
      SELF_PACED_ENDPOINTS.INSTRUCTOR_LINK_REVOKE(linkId),
      undefined,
      { silent: true }
    );
    return r.data;
  }

  async getOrders(params: {
    page: number;
    limit: number;
    course?: string;
  }): Promise<Paged<AttributedOrder>> {
    const r = await apiClient.get<ApiResponse<AttributedOrder[]>>(
      SELF_PACED_ENDPOINTS.INSTRUCTOR_ORDERS,
      { params }
    );
    return { data: r.data ?? [], meta: toMeta(r.meta, params.limit) };
  }

  async getEarnings(params: {
    page: number;
    limit: number;
  }): Promise<{ data: MySelfPacedEarnings; meta: InstructorListMeta }> {
    const r = await apiClient.get<ApiResponse<MySelfPacedEarnings>>(
      SELF_PACED_ENDPOINTS.INSTRUCTOR_EARNINGS,
      { params }
    );
    return {
      data: {
        config: r.data?.config,
        totalsByCurrency: r.data?.totalsByCurrency ?? [],
        courses: r.data?.courses ?? [],
        recentShares: r.data?.recentShares ?? [],
      },
      meta: toMeta(r.meta, params.limit),
    };
  }
}

export const selfPacedInstructorService = new SelfPacedInstructorService();
