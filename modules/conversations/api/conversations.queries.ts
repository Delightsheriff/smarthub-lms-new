"use client";

import { useQuery } from "@tanstack/react-query";
import { conversationsService } from "./conversations.service";
import { normaliseConversation } from "./normalise";
import type { ConversationListItem } from "../types";

export const CONVERSATIONS_QUERY_KEYS = {
  all: ["conversations", "list"] as const,
} as const;

export function useConversations() {
  return useQuery<ConversationListItem[]>({
    queryKey: CONVERSATIONS_QUERY_KEYS.all,
    queryFn: async () => {
      const raw = await conversationsService.getConversations();
      return (raw || []).map((conv) => normaliseConversation(conv));
    },
  });
}
