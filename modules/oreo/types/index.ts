/**
 * Oreo — the AI assistant. This module has no separate `api.types.ts`:
 * the ask surface is a hypermedia/AI seam (see ADR 0010), so the wire
 * shapes live here in `index.ts` only. UI never knows whether the
 * backend answering is the canned mock or a real agent loop.
 */

/** One tool invocation the assistant made to build its answer. Surfaced
 *  read-only in the "How I got this" panel (developer-audit view). */
export interface AskStep {
  tool: string;
  args?: Record<string, unknown>;
  result?: {
    ok?: boolean;
    data?: unknown;
    error?: string | null;
  };
}

export interface AskUsageSummary {
  tokensUsed: number;
  tokensLimit: number;
  tokensLeft: number;
  unlimited: boolean;
  blocked: boolean;
  monthStart: string;
}

export interface AskAnswer {
  answer: string;
  data: AskStep[];
  toolsUsed: string[];
  generatedQuery?: { collection?: string; pipeline?: unknown } | null;
  usage?: { promptTokens?: number; completionTokens?: number; costUsd?: number };
  monthUsage?: AskUsageSummary;
}

export interface AskHistoryTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AskTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  answer?: AskAnswer;
  error?: string;
  streaming?: boolean;
  status?: string;
}