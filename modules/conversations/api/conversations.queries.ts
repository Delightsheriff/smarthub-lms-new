"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/slices/authStore";
import { conversationsService } from "./conversations.service";
import { normaliseConversation } from "./normalise";
import type { ConversationListItem } from "../types";

export const CONVERSATIONS_QUERY_KEYS = {
  all: ["conversations", "list"] as const,
  list: (userId?: string) => ["conversations", "list", userId ?? ""] as const,
} as const;

export function useConversations() {
  const currentUserId = useAuthStore((s) => s.user?._id) || "";

  return useQuery<ConversationListItem[]>({
    queryKey: CONVERSATIONS_QUERY_KEYS.list(currentUserId),
    enabled: !!currentUserId,
    queryFn: async () => {
      const raw = await conversationsService.getConversations();
      return (raw || []).map((conv) => normaliseConversation(conv, currentUserId));
    },
  });
}

/** Marks a conversation read on open so its unread badge clears. */
export function useMarkConversationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => conversationsService.markRead(conversationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEYS.all });
    },
  });
}
