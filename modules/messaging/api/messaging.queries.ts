"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagingService } from "./messaging.service";
import { normaliseMessage } from "./normalise";
import type { ChatMessage } from "../types";
import { CONVERSATIONS_QUERY_KEYS } from "@/modules/conversations/api/conversations.queries";

export const MESSAGING_QUERY_KEYS = {
  thread: (conversationId: string) => ["messaging", "thread", conversationId] as const,
} as const;

export function useThread(conversationId: string | null) {
  return useQuery<ChatMessage[]>({
    queryKey: MESSAGING_QUERY_KEYS.thread(conversationId || ""),
    enabled: !!conversationId,
    queryFn: async () => {
      if (!conversationId) return [];
      const raw = await messagingService.getThreadMessages(conversationId);
      return (raw || []).map((msg) => normaliseMessage(msg));
    },
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const raw = await messagingService.sendMessage(conversationId, content);
      return normaliseMessage(raw);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGING_QUERY_KEYS.thread(conversationId) });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEYS.all });
    },
  });
}
