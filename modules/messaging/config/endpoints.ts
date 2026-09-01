import { LMS_PREFIX } from "@/lib/api/constants";

export const MESSAGING_ENDPOINTS = {
  MESSAGES: (conversationId: string) =>
    `${LMS_PREFIX}/conversations/${conversationId}/messages`,
} as const;
