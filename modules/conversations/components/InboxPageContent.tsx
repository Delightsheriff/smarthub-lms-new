"use client";

import React, { useState } from "react";
import { Inbox, MessageSquare } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversations } from "../api/conversations.queries";
import { ConversationListItemRow } from "./ConversationListItemRow";
import { AssignmentThread } from "@/modules/messaging/components/AssignmentThread";

export function InboxPageContent() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: conversations, isLoading, error } = useConversations();

  const filtered = (conversations || []).filter((c) => {
    if (typeFilter === "all") return true;
    return c.type === typeFilter;
  });

  const activeConv = (conversations || []).find((c) => c.id === activeId) || filtered[0];

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Inbox & Messages
          </h1>
          <p className="text-sm text-muted-foreground">
            Direct messages, cohort announcements, course discussions, and instructor support.
          </p>
        </div>

        {/* Type Filter Tabs */}
        <Tabs value={typeFilter} onValueChange={setTypeFilter}>
          <TabsList className="rounded-xl bg-muted/60 p-1 flex-wrap">
            <TabsTrigger value="all" className="rounded-lg text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="direct" className="rounded-lg text-xs">
              Direct
            </TabsTrigger>
            <TabsTrigger value="group" className="rounded-lg text-xs">
              Group
            </TabsTrigger>
            <TabsTrigger value="assignment" className="rounded-lg text-xs">
              Assignments
            </TabsTrigger>
            <TabsTrigger value="announcement" className="rounded-lg text-xs">
              Announcements
            </TabsTrigger>
            <TabsTrigger value="support" className="rounded-lg text-xs">
              Support
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Inbox Layout (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[540px]">
        {/* Left Column: Conversation List (5 Cols) */}
        <div className="md:col-span-5 space-y-3">
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 text-center space-y-1">
              <p className="text-xs font-medium text-destructive">
                Failed to load conversations.
              </p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {filtered.length > 0 ? (
                <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-none">
                  {filtered.map((conv) => (
                    <ConversationListItemRow
                      key={conv.id}
                      conversation={conv}
                      isActive={activeConv?.id === conv.id}
                      onSelect={() => setActiveId(conv.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center rounded-2xl border space-y-2">
                  <Inbox className="h-6 w-6 text-muted-foreground mx-auto" />
                  <p className="text-xs font-semibold text-foreground">
                    No conversations in this filter
                  </p>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Right Column: Active Thread Pane (7 Cols) */}
        <div className="md:col-span-7">
          {activeConv ? (
            <AssignmentThread
              conversationId={activeConv.id}
              title={activeConv.title}
            />
          ) : (
            <div className="h-full border rounded-2xl bg-card p-12 text-center flex flex-col items-center justify-center space-y-2">
              <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-semibold text-foreground">Select a Conversation</p>
              <p className="text-xs text-muted-foreground">
                Choose a conversation from the left to read messages and reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
