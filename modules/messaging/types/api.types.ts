export type ApiConversationType =
  | "direct"
  | "group"
  | "assignment"
  | "announcement"
  | "support";

export interface ApiConversation {
  _id: string;
  type: ApiConversationType;
  participants: Array<string | { _id: string; firstName?: string; lastName?: string; email?: string }>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiMessageSender {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
}

export type ApiMessageType = "text" | "file" | "audio" | "video" | "system";

export interface ApiMessage {
  _id: string;
  conversationId: string;
  sender: string | ApiMessageSender;
  content: string;
  type?: ApiMessageType;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface CreateMessagePayload {
  conversationId: string;
  content: string;
  type: ApiMessageType;
  replyTo?: string;
  attachments?: Array<{
    type: "image" | "video" | "audio" | "document" | "other";
    url: string;
    name: string;
    size: number;
    mimeType: string;
  }>;
}
