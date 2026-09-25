"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/slices/authStore";
import { messagingService } from "./messaging.service";
import { normaliseMessage } from "./normalise";
import type { ChatMessage } from "../types";

export const MESSAGING_QUERY_KEYS = {
  thread: (conversationId: string, userId?: string) =>
    ["messaging", "thread", conversationId, userId ?? ""] as const,
} as const;

export function useThread(conversationId: string | null) {
  const currentUserId = useAuthStore((s) => s.user?._id) || "";

  return useQuery<ChatMessage[]>({
    queryKey: MESSAGING_QUERY_KEYS.thread(conversationId || "", currentUserId),
    enabled: !!conversationId && !!currentUserId,
    queryFn: async () => {
      if (!conversationId) return [];
      const raw = await messagingService.getThreadMessages(conversationId);
      return (raw || []).map((msg) => normaliseMessage(msg, currentUserId));
    },
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?._id) || "";

  return useMutation({
    mutationFn: async (content: string) => {
      const raw = await messagingService.sendMessage(conversationId, content);
      return normaliseMessage(raw, currentUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messaging", "thread", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversations", "list"],
      });
    },
  });
}
