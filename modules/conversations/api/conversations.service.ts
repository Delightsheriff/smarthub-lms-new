import { apiClient } from "@/lib/api";
import { CONVERSATIONS_ENDPOINTS } from "../config/endpoints";
import type { ApiConversation } from "../types/api.types";

class ConversationsService {
  async getConversations(): Promise<ApiConversation[]> {
    return apiClient.get<ApiConversation[]>(CONVERSATIONS_ENDPOINTS.LIST);
  }

  /** Find or create the caller's staff thread for an assignment. Silent:
   *  it runs on every assignment page view, so no success toast. */
  async findOrCreateAssignmentConversation(body: {
    assignmentId: string;
    courseId: string;
    moduleId?: string;
  }): Promise<ApiConversation> {
    return apiClient.post<ApiConversation>(CONVERSATIONS_ENDPOINTS.ASSIGNMENT, body, {
      silent: true,
    });
  }

  /** Reset the caller's unread count for a conversation. */
  async markRead(conversationId: string): Promise<void> {
    await apiClient.patch(CONVERSATIONS_ENDPOINTS.MARK_READ(conversationId), {});
  }
}

export const conversationsService = new ConversationsService();
