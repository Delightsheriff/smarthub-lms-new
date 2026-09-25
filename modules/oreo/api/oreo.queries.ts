"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { oreoService, type OreoMode } from "./oreo.service";
import type { AskHistoryTurn, AskUsageSummary } from "../types";

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

/**
 * Ask a question via one-shot call.
 */
export function useAskOreo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      question,
      history = [],
      mode = "student",
    }: {
      question: string;
      history?: AskHistoryTurn[];
      mode?: OreoMode;
    }) => oreoService.ask(question, history, mode),
    onSuccess: () => {
      // Refresh the usage meter after every answer
      qc.invalidateQueries({ queryKey: OREO_QUERY_KEYS.usage });
    },
  });
}