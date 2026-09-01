"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatDateTime } from "@/lib/utils";
import type { ChatMessage } from "../types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const initials = message.senderName
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 max-w-[80%]",
        message.mine ? "ml-auto flex-row-reverse" : "mr-auto flex-row",
      )}
    >
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        <AvatarFallback
          className={cn(
            "text-[10px] font-bold",
            message.mine
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {initials || "U"}
        </AvatarFallback>
      </Avatar>

      <div className={cn("space-y-1", message.mine ? "items-end text-right" : "items-start")}>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-1">
          <span className="font-semibold text-foreground">{message.senderName}</span>
          <span className="font-mono">{formatDateTime(message.createdAt)}</span>
        </div>

        <div
          className={cn(
            "p-3 rounded-2xl text-xs leading-relaxed break-words shadow-2xs",
            message.mine
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : "bg-muted/70 text-foreground border rounded-tl-none",
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
