"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { oreoService } from "./oreo.service";
import type { AskUsageSummary } from "../types";

export const OREO_QUERY_KEYS = {
  usage: ["oreo", "usage"] as const,
  transcript: ["oreo", "transcript"] as const,
};

export function useOreoUsage() {
  return useQuery<AskUsageSummary>({
    queryKey: OREO_QUERY_KEYS.usage,
    queryFn: () => oreoService.getUsage(),
  });
}

/** Ask a question. The transcript lives in the page (component state);
 *  this mutation just resolves the answer. Errors surface via the shared
 *  interceptor toast and are returned to the caller to render in-line. */
export function useAskOreo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (question: string) => oreoService.ask(question),
    onSuccess: () => {
      // Usage moved — refresh the meter after every answer.
      qc.invalidateQueries({ queryKey: OREO_QUERY_KEYS.usage });
    },
  });
}