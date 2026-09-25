import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/slices/authStore";
import { OREO_ENDPOINTS } from "../config/endpoints";
import type { AskAnswer, AskHistoryTurn, AskUsageSummary } from "../types";

export type OreoMode = "student" | "instructor";

/** Callbacks the streaming reader fires as SSE frames arrive. */
export interface StreamHandlers {
  onStatus?: (message: string) => void;
  onToken?: (delta: string) => void;
  onReset?: () => void;
  onDone?: (answer: AskAnswer) => void;
  onError?: (message: string) => void;
}

/**
 * Stream an answer over Server-Sent Events from /lms/oreo/stream.
 * Talks to the API with fetch() and attaches the Bearer token.
 * Frames are decoded incrementally and dispatched to handler callbacks.
 */
export async function streamAsk(
  path: string,
  body: Record<string, unknown>,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const token = useAuthStore.getState().token;
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if ((err as { name?: string })?.name === "AbortError") return;
    handlers.onError?.("Something went wrong. Please try again.");
    return;
  }

  if (!res.ok || !res.body) {
    let msg = "Something went wrong.";
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {
      /* non-JSON error body */
    }
    handlers.onError?.(msg);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      for (const frame of frames) {
        const line = frame.trim();
        if (!line.startsWith("data:")) continue;
        let ev: {
          type?: string;
          message?: string;
          delta?: string;
        } & Partial<AskAnswer>;
        try {
          ev = JSON.parse(line.slice(5).trim());
        } catch {
          continue;
        }
        if (ev.type === "status") handlers.onStatus?.(ev.message ?? "");
        else if (ev.type === "token") handlers.onToken?.(ev.delta ?? "");
        else if (ev.type === "reset") handlers.onReset?.();
        else if (ev.type === "done") handlers.onDone?.(ev as AskAnswer);
        else if (ev.type === "error") handlers.onError?.(ev.message ?? "");
      }
    }
  } catch (err) {
    if ((err as { name?: string })?.name === "AbortError") return;
    handlers.onError?.("The connection was interrupted. Please try again.");
  }
}

class OreoService {
  /**
   * One-shot ask call with 120s timeout, sending { question, history, mode }.
   */
  async ask(
    question: string,
    history: AskHistoryTurn[] = [],
    mode: OreoMode = "student",
  ): Promise<AskAnswer> {
    return apiClient.post<AskAnswer>(
      OREO_ENDPOINTS.ASK,
      { question, history, mode },
      { timeout: 120_000 },
    );
  }

  /** Monthly token-usage meter for the transcript header. */
  async getUsage(): Promise<AskUsageSummary> {
    return apiClient.get<AskUsageSummary>(OREO_ENDPOINTS.USAGE);
  }
}

export const oreoService = new OreoService();