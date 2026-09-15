import { apiClient } from "@/lib/api";
import { CONVERSATIONS_ENDPOINTS } from "../config/endpoints";
import type { ApiConversation } from "../types/api.types";

class ConversationsService {
  async getConversations(): Promise<ApiConversation[]> {
    return apiClient.get<ApiConversation[]>(CONVERSATIONS_ENDPOINTS.LIST);
  }

  /** Reset the caller's unread count for a conversation. */
  async markRead(conversationId: string): Promise<void> {
    await apiClient.patch(CONVERSATIONS_ENDPOINTS.MARK_READ(conversationId), {});
  }
}

export const conversationsService = new ConversationsService();
