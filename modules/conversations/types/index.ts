import type { ConversationType } from "./api.types";

export interface ConversationAssignmentRef {
  id: string;
  title: string;
  courseSlug?: string;
  moduleSlug?: string;
}

export interface ConversationListItem {
  id: string;
  type: ConversationType;
  title: string;
  preview: string;
  updatedAt: string;
  unread: number;
  /** Resolved from metadata for assignment conversations. */
  assignment?: ConversationAssignmentRef;
  /** Display name of the peer in direct/support conversations. */
  otherName?: string;
  /** Course title lifted from metadata (assignment conversations). */
  courseName?: string;
  /** Participant avatars / info */
  participants?: Array<{ id: string; name: string; email?: string }>;
}
