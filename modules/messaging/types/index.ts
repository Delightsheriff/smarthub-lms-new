export interface Conversation {
  id: string;
  participantIds: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
  /** Computed by normaliser based on current auth user ID. */
  mine: boolean;
}
