import { LMS_PREFIX } from "@/lib/api/constants";

export const MESSAGING_ENDPOINTS = {
  MESSAGES: `${LMS_PREFIX}/messages`,
  CONVERSATION_MESSAGES: (conversationId: string) =>
    `${LMS_PREFIX}/messages/conversation/${conversationId}`,
  MARK_CONVERSATION_READ: (conversationId: string) =>
    `${LMS_PREFIX}/messages/conversation/${conversationId}/read-all`,
  MARK_MESSAGE_READ: (messageId: string) =>
    `${LMS_PREFIX}/messages/${messageId}/read`,
} as const;
