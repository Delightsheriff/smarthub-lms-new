"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/slices/authStore";
import { conversationsService } from "./conversations.service";
import { normaliseConversation } from "./normalise";
import type { ConversationListItem } from "../types";

export const CONVERSATIONS_QUERY_KEYS = {
  all: ["conversations", "list"] as const,
  list: (userId?: string) => ["conversations", "list", userId ?? ""] as const,
  assignment: (assignmentId: string) => ["conversations", "assignment", assignmentId] as const,
} as const;

export function useConversations() {
  const currentUserId = useAuthStore((s) => s.user?._id) || "";

  return useQuery<ConversationListItem[]>({
    queryKey: CONVERSATIONS_QUERY_KEYS.list(currentUserId),
    enabled: !!currentUserId,
    queryFn: async () => {
      const raw = await conversationsService.getConversations();
      return (raw || []).map((conv) => normaliseConversation(conv, currentUserId));
    },
  });
}

/** Marks a conversation read on open so its unread badge clears. */
export function useMarkConversationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => conversationsService.markRead(conversationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEYS.all });
    },
  });
}

/** The student's staff thread for one assignment (created on first view).
 *  Returns the conversation id. */
export function useAssignmentConversation(args: {
  assignmentId?: string;
  courseId?: string;
  moduleId?: string;
}) {
  const { assignmentId, courseId, moduleId } = args;
  return useQuery({
    queryKey: CONVERSATIONS_QUERY_KEYS.assignment(assignmentId ?? ""),
    enabled: !!assignmentId && !!courseId,
    staleTime: Infinity,
    queryFn: async () => {
      const convo = await conversationsService.findOrCreateAssignmentConversation({
        assignmentId: assignmentId as string,
        courseId: courseId as string,
        moduleId,
      });
      return convo._id;
    },
  });
}
