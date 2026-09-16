"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Send, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/lib/socket/socket-provider";
import { useThread, useSendMessage } from "../api/messaging.queries";
import { MessageBubble } from "./MessageBubble";

interface AssignmentThreadProps {
  conversationId: string;
  title?: string;
  /** Deep-links the thread header back to the assignment it's scoped
   *  to, e.g. `/assignments/${assignmentId}`. Omitted for non-
   *  assignment conversations. */
  assignmentHref?: string;
}

export function AssignmentThread({ conversationId, title, assignmentHref }: AssignmentThreadProps) {
  const [content, setContent] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading, refetch } = useThread(conversationId);
  const sendMessageMutation = useSendMessage(conversationId);

  const socket = useSocket();

  // Socket listener for live arrival
  useEffect(() => {
    if (!socket) return;
    const handleCreated = (data: unknown) => {
      const msg = data as { conversationId?: string };
      if (msg?.conversationId === conversationId) {
        refetch();
      }
    };

    socket.on("message:created", handleCreated);
    return () => {
      socket.off("message:created", handleCreated);
    };
  }, [socket, conversationId, refetch]);

  // Auto-scroll feed on new messages
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || sendMessageMutation.isPending) return;

    setContent("");
    try {
      await sendMessageMutation.mutateAsync(trimmed);
      if (socket) {
        socket.emit("message:created", { conversationId, content: trimmed });
      }
    } catch {
      // Revert if mutation fails
      setContent(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-2xl bg-card overflow-hidden shadow-xs">
      {/* Thread Header */}
      {title && (
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="h-4 w-4 text-primary shrink-0" />
            <h3 className="font-semibold text-xs text-foreground truncate">{title}</h3>
          </div>
          {assignmentHref && (
            <Link
              href={assignmentHref}
              className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              Open assignment
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}

      {/* Message Feed */}
      <div
        ref={feedRef}
        className="flex-1 p-4 space-y-4 overflow-y-auto min-h-[300px] max-h-[460px] scrollbar-none"
      >
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-12 w-2/3 rounded-2xl" />
            <Skeleton className="h-12 w-1/2 ml-auto rounded-2xl" />
          </div>
        )}

        {!isLoading && messages && messages.length > 0 ? (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        ) : !isLoading ? (
          <div className="text-center py-12 text-xs text-muted-foreground space-y-1">
            <MessageSquare className="h-6 w-6 mx-auto text-muted-foreground/60" />
            <p>No messages in this conversation yet.</p>
            <p className="text-[11px] text-muted-foreground/60">
              Type a message below to start the thread.
            </p>
          </div>
        ) : null}
      </div>

      {/* Composer Footer */}
      <div className="p-3 border-t bg-card flex items-center gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message... (Press Enter to send)"
          rows={1}
          className="min-h-[40px] max-h-[120px] resize-none text-xs rounded-xl py-2.5 px-3"
        />
        <Button
          onClick={handleSend}
          disabled={!content.trim() || sendMessageMutation.isPending}
          size="icon"
          className="rounded-xl shrink-0 h-10 w-10"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
