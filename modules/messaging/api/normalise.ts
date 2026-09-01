import type { ApiMessage, ApiMessageSender } from "../types/api.types";
import type { ChatMessage } from "../types";

export function normaliseMessage(
  api: ApiMessage,
  currentUserId = "usr_1",
): ChatMessage {
  let senderId = "unknown";
  let senderName = "User";
  let senderAvatar: string | undefined = undefined;

  if (typeof api.sender === "string") {
    senderId = api.sender;
    senderName = senderId === currentUserId ? "You" : "Member";
  } else if (api.sender && typeof api.sender === "object") {
    const s = api.sender as ApiMessageSender;
    senderId = s._id;
    senderName = [s.firstName, s.lastName].filter(Boolean).join(" ") || s.email || "User";
    senderAvatar = s.imageUrl;
  }

  const mine = senderId === currentUserId;

  return {
    id: api._id,
    conversationId: api.conversationId,
    senderId,
    senderName: mine ? "You" : senderName,
    senderAvatar,
    content: api.content || "",
    createdAt: api.createdAt || new Date().toISOString(),
    mine,
  };
}
