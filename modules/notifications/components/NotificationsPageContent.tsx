"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Award, BookOpen, Megaphone, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDateTime } from "@/lib/utils";
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
} from "../api/notifications.queries";

export function NotificationsPageContent() {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notifications, isLoading, error } = useNotifications();
  const markReadMutation = useMarkRead();
  const markAllReadMutation = useMarkAllRead();

  const items = (notifications || []).filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "grade":
        return <Award className="h-5 w-5 text-emerald-600" />;
      case "material":
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case "announcement":
        return <Megaphone className="h-5 w-5 text-amber-600" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Notifications Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Grade alerts, material announcements, and cohort updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 text-center space-y-1">
          <p className="text-sm font-medium text-destructive">
            Failed to load notifications.
          </p>
        </div>
      )}

      {/* List */}
      {!isLoading && !error && (
        <>
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((n) => (
                <Card
                  key={n.id}
                  onClick={() => !n.read && markReadMutation.mutate(n.id)}
                  className={cn(
                    "rounded-2xl border bg-card transition-colors shadow-xs cursor-pointer",
                    !n.read ? "border-primary/40 bg-primary/5" : "hover:bg-muted/30",
                  )}
                >
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-muted/60 shrink-0">
                        {getIcon(n.type)}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground truncate">
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
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-12 text-center space-y-2 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="text-base font-semibold text-foreground">No Notifications</h3>
              <p className="text-xs">
                {filter === "unread"
                  ? "You have no unread notifications."
                  : "Your notification inbox is currently empty."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
