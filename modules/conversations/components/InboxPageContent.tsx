"use client";

import React, { useEffect, useState } from "react";
import { Inbox, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useConversations, useMarkConversationRead } from "../api/conversations.queries";
import { ConversationListItemRow } from "./ConversationListItemRow";
import { AssignmentThread } from "@/modules/messaging/components/AssignmentThread";

export function InboxPageContent() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: conversations, isLoading, isFetching, error, refetch } = useConversations();
  const markRead = useMarkConversationRead();

  const filtered = (conversations || []).filter((c) => {
    if (typeFilter === "all") return true;
    return c.type === typeFilter;
  });

  const activeConv = (conversations || []).find((c) => c.id === activeId) || filtered[0];

  // Marks read whenever the active thread changes — covers both an
  // explicit row click and the default-selected first conversation,
  // which previously never cleared its unread badge either.
  useEffect(() => {
    if (activeConv?.id) markRead.mutate(activeConv.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv?.id]);

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        divider
        dateline={`${dateline} · Student Communications`}
        title="Inbox & Messages"
        description={
          conversations && conversations.length > 0 ? (
            <>
              Direct messages, cohort announcements, and instructor support.{" "}
              <strong className="text-foreground">{conversations.length}</strong> active thread{conversations.length === 1 ? "" : "s"}.
            </>
          ) : (
            "Direct messages, cohort announcements, course discussions, and instructor support."
          )
        }
        actions={
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="min-w-0 overflow-x-auto pb-0.5 max-w-full -mx-1 px-1">
              <Tabs value={typeFilter} onValueChange={setTypeFilter}>
                <TabsList className="rounded-xl bg-muted/60 p-1 w-max">
                  <TabsTrigger value="all" className="rounded-lg text-xs">All</TabsTrigger>
                  <TabsTrigger value="direct" className="rounded-lg text-xs">Direct</TabsTrigger>
                  <TabsTrigger value="group" className="rounded-lg text-xs">Group</TabsTrigger>
                  <TabsTrigger value="assignment" className="rounded-lg text-xs">Assignments</TabsTrigger>
                  <TabsTrigger value="announcement" className="rounded-lg text-xs">Announcements</TabsTrigger>
                  <TabsTrigger value="support" className="rounded-lg text-xs">Support</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <RefreshButton loading={isFetching} onClick={refetch} />
          </div>
        }
      />

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
                <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border max-h-[580px] overflow-y-auto scrollbar-none shadow-xs">
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
                <EmptyState icon={Inbox} title="No conversations in this filter" />
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
              assignmentHref={
                activeConv.assignment ? `/assignments/${activeConv.assignment.id}` : undefined
              }
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
