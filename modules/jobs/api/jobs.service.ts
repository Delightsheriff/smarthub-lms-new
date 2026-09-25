import { apiClient } from "@/lib/api/client";
import { JOBS_ENDPOINTS } from "../config/endpoints";
import type { Job, JobsPage, JobsQuery } from "../types";

class JobsService {
  async list(query: JobsQuery): Promise<JobsPage> {
    const params: Record<string, string> = {};
    if (query.page) params.page = String(query.page);
    if (query.pageSize) params.pageSize = String(query.pageSize);
    if (query.keyword) params.keyword = query.keyword;
    if (query.company) params.company = query.company;
    // Only send `remote` when the student actually picked a side —
    // sending `false` by default would hide every on-site role.
    if (typeof query.remote === "boolean") params.remote = String(query.remote);
    // Only sent for "all" — the API already defaults to the student's
    // own courses, so sending "mine" would just be noise on the URL.
    if (query.scope === "all") params.scope = "all";

    return apiClient.get<JobsPage>(JOBS_ENDPOINTS.LIST, { params });
  }

  async companies(): Promise<string[]> {
    // Await first: a Promise is never nullish, so `get() ?? []` never
    // fell back when the API sent `data: null`.
    return (await apiClient.get<string[] | null>(JOBS_ENDPOINTS.COMPANIES)) ?? [];
  }

  async detail(id: string): Promise<Job> {
    return apiClient.get<Job>(JOBS_ENDPOINTS.DETAIL(id));
  }
}

export const jobsService = new JobsService();
