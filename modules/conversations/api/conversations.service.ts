import { apiClient } from "@/lib/api";
import { CONVERSATIONS_ENDPOINTS } from "../config/endpoints";
import type { ApiConversation } from "../types/api.types";

class ConversationsService {
  async getConversations(): Promise<ApiConversation[]> {
    return apiClient.get<ApiConversation[]>(CONVERSATIONS_ENDPOINTS.LIST);
  }
}

export const conversationsService = new ConversationsService();
