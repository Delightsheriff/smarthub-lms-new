import { apiClient } from "@/lib/api/client";
import { ACCESS_ENDPOINTS } from "../config/endpoints";
import type { AccessStatus } from "../types";

/**
 * Why the learner can or can't see a course.
 *
 * Reachable by someone holding only a revoked enrolment — that is the
 * point of it. Everything else under /lms 403s for them, and a 403 has
 * no client handler, so without this they get pages that silently fail
 * to load and no way to tell a lockout from a bug.
 */
export const accessService = {
  status: async (): Promise<AccessStatus> => {
    return apiClient.get<AccessStatus>(ACCESS_ENDPOINTS.STATUS, { silent: true });
  },
};
