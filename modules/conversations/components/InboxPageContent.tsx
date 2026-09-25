"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Inbox, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useConversations, useMarkConversationRead } from "../api/conversations.queries";
import { ConversationListItemRow } from "./ConversationListItemRow";
import { AssignmentThread } from "@/modules/messaging/components/AssignmentThread";
import { cn, pluralize } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function InboxPageContent() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const isDesktop = !useIsMobile();

  const { data: conversations, isLoading, isFetching, error, refetch } = useConversations();
  const markRead = useMarkConversationRead();

  const filtered = (conversations || []).filter((c) => {
    if (typeFilter === "all") return true;
    return c.type === typeFilter;
  });

  // On desktop, default to the first conversation if none explicitly selected.
  // On mobile, keep activeId null so the user lands on the conversation list.
  const activeConv =
    (conversations || []).find((c) => c.id === activeId) ||
    (isDesktop ? filtered[0] : null);

  // Mark read when thread pane is actually visible:
  // On desktop: whenever activeConv changes and is displayed side-by-side.
  // On mobile: only when a thread was explicitly selected (activeId !== null).
  useEffect(() => {
    if (!activeConv?.id) return;
    if (isDesktop || activeId !== null) {
      markRead.mutate(activeConv.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv?.id, isDesktop, activeId]);

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    markRead.mutate(id);
  };

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
              <strong className="text-foreground">{conversations.length}</strong> active{" "}
              {pluralize(conversations.length, "thread", undefined, false)}.
            </>
          ) : (
            "Direct messages, cohort announcements, course discussions, and instructor support."
          )
        }
        actions={
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val ?? "all")}>
              <SelectTrigger className="w-[160px] sm:w-[180px] rounded-xl text-xs h-9">
                <SelectValue placeholder="All Threads" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Threads</SelectItem>
                <SelectItem value="direct">Direct Messages</SelectItem>
                <SelectItem value="group">Group Chats</SelectItem>
                <SelectItem value="assignment">Assignments</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
            <RefreshButton loading={isFetching} onClick={refetch} />
          </div>
        }
      />

      {/* Main Inbox Layout (Master/Detail below md) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[540px]">
        {/* Left Column: Conversation List */}
        <div
          className={cn(
            "space-y-3 md:col-span-5",
            activeId ? "hidden md:block" : "block",
          )}
        >
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
                      onSelect={() => handleSelectConversation(conv.id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState icon={Inbox} title="No conversations in this filter" />
              )}
            </>
          )}
        </div>

        {/* Right Column: Active Thread Pane */}
        <div
          className={cn(
            "md:col-span-7",
            !activeId ? "hidden md:block" : "block",
          )}
        >
          {activeConv ? (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveId(null)}
                className="md:hidden gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back to conversations
              </Button>
              <AssignmentThread
                conversationId={activeConv.id}
                title={activeConv.title}
                assignmentHref={
                  activeConv.assignment ? `/assignments/${activeConv.assignment.id}` : undefined
                }
              />
            </div>
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
