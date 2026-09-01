"use client";

import { useConversations } from "@/modules/conversations/api/conversations.queries";

/**
 * Total unread message count across the signed-in user's conversations,
 * used for the inbox badge in the side rail + bottom nav.
 */
export function useInboxUnreadCount(): number {
  const { data: conversations } = useConversations();
  if (!conversations) return 0;
  return conversations.reduce((sum, c) => sum + (c.unread ?? 0), 0);
}
