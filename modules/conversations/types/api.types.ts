export interface ApiUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
  role?: string;
}

export interface ApiMessage {
  _id: string;
  conversationId: string;
  sender: ApiUser | string;
  content: string;
  createdAt: string;
}

export interface ApiAssignmentRef {
  _id: string;
  title: string;
  courseSlug?: string;
  moduleSlug?: string;
}

export interface ApiCourseRef {
  _id: string;
  title: string;
  slug?: string;
}

export interface ApiModuleRef {
  _id: string;
  title: string;
  slug?: string;
}

export type ConversationType =
  | "direct"
  | "group"
  | "assignment"
  | "announcement"
  | "support";

export interface ApiConversation {
  _id: string;
  type: ConversationType;
  participants: ApiUser[];
  lastMessage?: ApiMessage | null;
  unreadCount?: Record<string, number> | number;
  updatedAt: string;
  metadata?: {
    assignmentId?: ApiAssignmentRef | string | null;
    courseId?: ApiCourseRef | string | null;
    moduleId?: ApiModuleRef | string | null;
  };
}
