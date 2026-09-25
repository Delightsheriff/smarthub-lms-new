import { apiClient } from "@/lib/api";
import { MESSAGING_ENDPOINTS } from "../config/endpoints";
import type { ApiMessage, ApiMessageType, CreateMessagePayload } from "../types/api.types";

class MessagingService {
  async getThreadMessages(conversationId: string): Promise<ApiMessage[]> {
    const res = await apiClient.getPaginated<ApiMessage>(
      MESSAGING_ENDPOINTS.CONVERSATION_MESSAGES(conversationId),
    );
    return res.data;
  }

  async sendMessage(
    conversationId: string,
    content: string,
    type: ApiMessageType = "text",
  ): Promise<ApiMessage> {
    const payload: CreateMessagePayload = {
      conversationId,
      content,
      type,
    };
    return apiClient.post<ApiMessage>(MESSAGING_ENDPOINTS.MESSAGES, payload);
  }
}

export const messagingService = new MessagingService();
