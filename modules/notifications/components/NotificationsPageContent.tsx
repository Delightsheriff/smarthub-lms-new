"use client";

import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Ledger, LedgerItem } from "@/components/ui/ledger";
import { formatDateTime, pluralize } from "@/lib/utils";
import { notificationTypeStyle } from "../lib/notification-type";
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
} from "../api/notifications.queries";

export function NotificationsPageContent() {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notifications, isLoading, isFetching, error, refetch } = useNotifications();
  const markReadMutation = useMarkRead();
  const markAllReadMutation = useMarkAllRead();

  const items = (notifications || []).filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  const dateline = `${(notifications || []).length} Total · ${unreadCount} Unread`;

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        title="Notifications Center"
        dateline={dateline}
        divider
        description={
          unreadCount > 0
            ? `You have ${pluralize(unreadCount, "unread notification")}. Stay updated on grades, materials, and cohort activity.`
            : "All caught up! Grade alerts, material announcements, and cohort updates appear here."
        }
        actions={<RefreshButton loading={isFetching} onClick={refetch} />}
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 text-center space-y-1">
          <p className="text-sm font-medium text-destructive">
            Failed to load notifications.
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <Ledger
          title="All notifications"
          count={items.length}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
                <TabsList className="rounded-lg bg-muted/60 p-0.5">
                  <TabsTrigger value="all" className="rounded-md px-2.5 py-1 text-[11px]">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="rounded-md px-2.5 py-1 text-[11px]">
                    Unread ({unreadCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllReadMutation.mutate()}
                  className="h-7 rounded-lg px-2 text-[11px]"
                >
                  <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark all read
                </Button>
              )}
            </div>
          }
          empty={
            <EmptyState
              icon={Bell}
              title="No notifications"
              description={
                filter === "unread"
                  ? "You have no unread notifications."
                  : "Your notification inbox is currently empty."
              }
              className="border-none shadow-none"
            />
          }
        >
          {items.map((n) => {
            const style = notificationTypeStyle(n.type);
            return (
              <LedgerItem
                key={n.id}
                icon={style.icon}
                iconClassName={style.className}
                href={n.actionUrl || undefined}
                onClick={!n.read ? () => markReadMutation.mutate(n.id) : undefined}
                title={
                  <span className="inline-flex items-center gap-2">
                    {n.title}
                    {!n.read && (
                      <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0">
                        New
                      </Badge>
                    )}
                  </span>
                }
                meta={n.body}
                when={formatDateTime(n.createdAt)}
              />
            );
          })}
        </Ledger>
      )}
    </div>
  );
}
