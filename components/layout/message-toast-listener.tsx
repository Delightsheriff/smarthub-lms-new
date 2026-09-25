"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSocket } from "@/lib/socket/socket-provider";
import { getActiveThreadId } from "@/lib/socket/active-thread";
import { useAuthStore } from "@/store/slices/authStore";
import { CONVERSATIONS_QUERY_KEYS } from "@/modules/conversations/api/conversations.queries";
import type { ApiMessage } from "@/modules/messaging/types/api.types";

/**
 * App-wide listener for realtime socket events:
 * - `message:new`: Toast for incoming messages from others when their thread is not currently open,
 *   and keep the conversations list and unread count query cache up to date.
 * - `conversation:updated`: Refresh conversation list & unread count badge queries when
 *   nudged in the user's personal room.
 */
export function MessageToastListener() {
  const socket = useSocket();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdated = () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEYS.all });
    };

    const handleMessageNew = (payload: ApiMessage) => {
      if (!payload) return;

      // Always invalidate the conversation list and unread badge queries
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEYS.all });

      const currentUserId = useAuthStore.getState().user?._id;
      const sender = typeof payload.sender === "object" ? payload.sender : null;
      const senderId = sender?._id ?? (typeof payload.sender === "string" ? payload.sender : undefined);

      // Don't toast for your own messages
      if (currentUserId && senderId === currentUserId) return;

      // Don't toast for the thread that is currently open
      if (payload.conversationId && payload.conversationId === getActiveThreadId()) return;

      const name = sender
        ? [sender.firstName, sender.lastName].filter(Boolean).join(" ") || sender.email || "SmartHub"
        : "SmartHub";
      const preview = payload.content?.trim() || "New message received";

      toast.message(`New message from ${name}`, {
        description: preview.length > 80 ? preview.slice(0, 77) + "…" : preview,
        action: {
          label: "Open",
          onClick: () => router.push("/inbox"),
        },
      });
    };

    socket.on("message:new", handleMessageNew);
    socket.on("conversation:updated", handleConversationUpdated);

    return () => {
      socket.off("message:new", handleMessageNew);
      socket.off("conversation:updated", handleConversationUpdated);
    };
  }, [socket, router, queryClient]);

  return null;
}
