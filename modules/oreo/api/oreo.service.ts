import { apiClient } from "@/lib/api";
import { OREO_ENDPOINTS } from "../config/endpoints";
import type { AskAnswer, AskUsageSummary } from "../types";

class OreoService {
  /** One-shot ask. The mock resolves a canned answer after a short
   *  delay; the SSE `streamAsk` reader is the deferred Plan-012 adapter
   *  and is intentionally not wired yet. */
  async ask(question: string): Promise<AskAnswer> {
    return apiClient.post<AskAnswer>(OREO_ENDPOINTS.ASK, { question });
  }

  /** Monthly token-usage meter for the transcript header. */
  async getUsage(): Promise<AskUsageSummary> {
    return apiClient.get<AskUsageSummary>(OREO_ENDPOINTS.USAGE);
  }
}

export const oreoService = new OreoService();