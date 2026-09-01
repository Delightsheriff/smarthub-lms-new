import { apiClient } from "@/lib/api";
import { MESSAGING_ENDPOINTS } from "../config/endpoints";
import type { ApiMessage } from "../types/api.types";

class MessagingService {
  async getThreadMessages(conversationId: string): Promise<ApiMessage[]> {
    return apiClient.get<ApiMessage[]>(MESSAGING_ENDPOINTS.MESSAGES(conversationId));
  }

  async sendMessage(
    conversationId: string,
    content: string,
    type: "text" | "file" | "audio" | "video" | "system" = "text",
  ): Promise<ApiMessage> {
    return apiClient.post<ApiMessage>(MESSAGING_ENDPOINTS.MESSAGES(conversationId), {
      content,
      type,
    });
  }
}

export const messagingService = new MessagingService();
