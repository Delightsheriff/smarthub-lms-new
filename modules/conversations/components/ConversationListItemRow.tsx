"use client";

import React from "react";
import { MessageSquare, Users, Megaphone, LifeBuoy, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatDateTime } from "@/lib/utils";
import type { ConversationListItem } from "../types";

interface ConversationListItemRowProps {
  conversation: ConversationListItem;
  isActive: boolean;
  onSelect: () => void;
}

export function ConversationListItemRow({
  conversation,
  isActive,
  onSelect,
}: ConversationListItemRowProps) {
  const getIcon = () => {
    switch (conversation.type) {
      case "group":
        return <Users className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-primary")} />;
      case "announcement":
        return <Megaphone className={cn("h-4 w-4 shrink-0", isActive ? "text-warning" : "text-warning")} />;
      case "support":
        return <LifeBuoy className={cn("h-4 w-4 shrink-0", isActive ? "text-success" : "text-success")} />;
      case "assignment":
        return <FileText className={cn("h-4 w-4 shrink-0", isActive ? "text-accent" : "text-accent")} />;
      case "direct":
      default:
        return <MessageSquare className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-primary")} />;
    }
  };

  const initials = conversation.title
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "w-full text-left p-3.5 transition-colors duration-150 space-y-2 select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-primary text-primary-foreground shadow-xs"
          : "hover:bg-muted/50 text-foreground",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback
              className={cn(
                "font-semibold text-xs transition-colors",
                isActive
                  ? "bg-primary-foreground text-primary font-bold"
                  : "bg-primary/10 text-primary",
              )}
            >
              {initials || "C"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {getIcon()}
              <span className={cn(
                "font-semibold text-xs truncate",
                isActive ? "text-primary-foreground" : "text-foreground",
              )}>
                {conversation.title}
              </span>
            </div>
            <p className={cn(
              "text-xs truncate max-w-[200px] mt-0.5",
              isActive ? "text-primary-foreground/80" : "text-muted-foreground",
            )}>
              {conversation.preview}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={cn(
            "text-[10px] font-mono",
            isActive ? "text-primary-foreground/75" : "text-muted-foreground",
          )}>
            {formatDateTime(conversation.updatedAt)}
          </span>
          {conversation.unread > 0 && (
            <Badge
              className={cn(
                "text-[10px] px-1.5 py-0 h-4 rounded-full font-bold",
                isActive
                  ? "bg-primary-foreground text-primary"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {conversation.unread}
            </Badge>
          )}
        </div>
      </div>

      {/* Assignment Chip */}
      {conversation.assignment && (
        <div className={cn(
          "pt-1 border-t flex items-center justify-between text-[11px]",
          isActive ? "border-primary-foreground/20 text-primary-foreground/90" : "border-border/50 text-muted-foreground",
        )}>
          <span className="flex items-center gap-1 min-w-0">
            <FileText className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[180px] font-medium">
              {conversation.assignment.title}
            </span>
          </span>
          <span className={cn(
            "text-[10px] font-semibold uppercase tracking-wider shrink-0 ml-2",
            isActive ? "text-primary-foreground" : "text-accent",
          )}>
            Assignment
          </span>
        </div>
      )}
    </button>
  );
}
