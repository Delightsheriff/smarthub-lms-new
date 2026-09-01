import type { ApiConversation, ApiCourseRef, ApiModuleRef } from "../types/api.types";
import type { ConversationListItem, ConversationAssignmentRef } from "../types";

export function normaliseConversation(
  api: ApiConversation,
  currentUserId = "usr_1",
): ConversationListItem {
  // Extract participants
  const participants = (api.participants || []).map((p) => ({
    id: p._id,
    name: [p.firstName, p.lastName].filter(Boolean).join(" ") || p.email || "User",
    email: p.email,
  }));

  // Peer in direct/support
  const peer = participants.find((p) => p.id !== currentUserId) || participants[0];
  const otherName = peer?.name || "Member";

  // Title derivation
  let title = "Conversation";
  if (api.type === "direct" || api.type === "support") {
    title = api.type === "support" ? `Support: ${otherName}` : otherName;
  } else if (api.type === "announcement") {
    title = "Cohort Announcements";
  } else if (api.type === "group") {
    title = "Cohort Group Chat";
  } else if (api.type === "assignment") {
    const asgnRef = api.metadata?.assignmentId;
    if (asgnRef && typeof asgnRef === "object") {
      title = asgnRef.title || "Assignment Thread";
    } else {
      title = "Assignment Thread";
    }
  }

  // Assignment chip resolution from metadata
  let assignment: ConversationAssignmentRef | undefined = undefined;
  if (api.type === "assignment" && api.metadata?.assignmentId) {
    const asgnRef = api.metadata.assignmentId;
    const courseRef = api.metadata.courseId as ApiCourseRef | undefined;
    const moduleRef = api.metadata.moduleId as ApiModuleRef | undefined;

    if (typeof asgnRef === "object" && asgnRef._id) {
      assignment = {
        id: asgnRef._id,
        title: asgnRef.title || "Assignment",
        courseSlug: courseRef?.slug || "full-stack-web-development",
        moduleSlug: moduleRef?.slug,
      };
    } else if (typeof asgnRef === "string") {
      assignment = {
        id: asgnRef,
        title: "Assignment",
        courseSlug: courseRef?.slug || "full-stack-web-development",
        moduleSlug: moduleRef?.slug,
      };
    }
  }

  // Course name from metadata
  const courseRef = api.metadata?.courseId as ApiCourseRef | undefined;
  const courseName = courseRef && typeof courseRef === "object" ? courseRef.title : undefined;

  // Unread calculation
  let unread = 0;
  if (typeof api.unreadCount === "number") {
    unread = api.unreadCount;
  } else if (api.unreadCount && typeof api.unreadCount === "object") {
    unread = api.unreadCount[currentUserId] || 0;
  }

  // Preview text
  const preview = api.lastMessage?.content || "No messages yet";

  return {
    id: api._id,
    type: api.type,
    title,
    preview,
    updatedAt: api.updatedAt || api.lastMessage?.createdAt || new Date().toISOString(),
    unread,
    assignment,
    otherName,
    courseName,
    participants,
  };
}
