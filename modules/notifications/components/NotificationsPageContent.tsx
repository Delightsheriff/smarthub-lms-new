"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Stagger, StaggerItem } from "@/components/animation/stagger";
import { cn, formatDateTime } from "@/lib/utils";
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
        eyebrow="Notifications"
        title="Notifications Center"
        dateline={dateline}
        divider
        description={
          unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}. Stay updated on grades, materials, and cohort activity.`
            : "All caught up! Grade alerts, material announcements, and cohort updates appear here."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <RefreshButton loading={isFetching} onClick={refetch} />
            <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
              <TabsList className="rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="all" className="rounded-lg text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="rounded-lg text-xs">
                  Unread ({unreadCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllReadMutation.mutate()}
                className="rounded-xl text-xs"
              >
                <CheckCheck className="mr-1.5 h-4 w-4" /> Mark All Read
              </Button>
            )}
          </div>
        }
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
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
        <>
          {items.length > 0 ? (
            <Stagger className="space-y-3">
              {items.map((n) => {
                const style = notificationTypeStyle(n.type);
                const Icon = style.icon;
                return (
                  <StaggerItem key={n.id}>
                    <Card
                      onClick={() => !n.read && markReadMutation.mutate(n.id)}
                      className={cn(
                        "relative overflow-hidden rounded-2xl border border-border bg-card transition-colors shadow-xs cursor-pointer",
                        !n.read ? "hover:bg-muted/20" : "hover:bg-muted/30",
                      )}
                    >
                      {/* A solid accent bar reads as "unread" at a glance
                          — clearer than tinting the whole card, which
                          reads as "selected" more than "new". */}
                      {!n.read && (
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-1 bg-primary"
                        />
                      )}
                      <CardContent className="p-4 pl-5 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                              style.className,
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-semibold text-sm text-foreground truncate">
                                {n.title}
                              </span>
                              {!n.read && (
                                <Badge className="bg-primary text-primary-foreground text-[10px]">
                                  New
                                </Badge>
                              )}
                            </div>

                            {n.body && (
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {n.body}
                              </p>
                            )}

                            {n.actionUrl && (
                              <div className="pt-1">
                                <Button
                                  render={<Link href={n.actionUrl} />}
                                  variant="ghost"
                                  size="xs"
                                  className="text-xs text-primary font-medium p-0 h-auto hover:bg-transparent"
                                >
                                  Open details <ExternalLink className="ml-1 h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        <span className="text-xs text-muted-foreground font-mono shrink-0">
                          {formatDateTime(n.createdAt)}
                        </span>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                );
              })}
            </Stagger>
          ) : (
            <EmptyState
              icon={Bell}
              title="No notifications"
              description={
                filter === "unread"
                  ? "You have no unread notifications."
                  : "Your notification inbox is currently empty."
              }
            />
          )}
        </>
      )}
    </div>
  );
}
