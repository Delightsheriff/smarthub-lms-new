"use client";

import React from "react";
import Link from "next/link";
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
        return <Users className="h-4 w-4 text-blue-600" />;
      case "announcement":
        return <Megaphone className="h-4 w-4 text-amber-600" />;
      case "support":
        return <LifeBuoy className="h-4 w-4 text-emerald-600" />;
      case "assignment":
        return <FileText className="h-4 w-4 text-purple-600" />;
      case "direct":
      default:
        return <MessageSquare className="h-4 w-4 text-primary" />;
    }
  };

  const initials = conversation.title
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-3 rounded-2xl border transition-all cursor-pointer space-y-2 select-none",
        isActive
          ? "border-primary bg-primary/5 shadow-xs"
          : "border-border bg-card hover:bg-muted/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {initials || "C"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-foreground truncate">
                {conversation.title}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {conversation.preview}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] text-muted-foreground font-mono">
            {formatDateTime(conversation.updatedAt)}
          </span>
          {conversation.unread > 0 && (
            <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4 rounded-full font-bold">
              {conversation.unread}
            </Badge>
          )}
        </div>
      </div>

      {/* Assignment Chip */}
      {conversation.assignment && (
        <div className="pt-1 border-t border-muted/50 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground flex items-center gap-1">
            <FileText className="h-3 w-3 text-purple-600 shrink-0" />
            <span className="truncate max-w-[180px] font-medium text-foreground">
              {conversation.assignment.title}
            </span>
          </span>
          <Link
            href={`/assignments/${conversation.assignment.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-primary hover:underline text-[10px] font-medium"
          >
            View Task →
          </Link>
        </div>
      )}
    </div>
  );
}
