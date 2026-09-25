"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, CheckCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDateTime } from "@/lib/utils";
import { useSocket } from "@/lib/socket/socket-provider";
import { useNotificationChime } from "@/hooks/use-notification-chime";
import { useTitleNotifier } from "@/hooks/use-title-notifier";
import { notificationTypeStyle } from "../lib/notification-type";
import {
  NOTIFICATIONS_QUERY_KEYS,
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
} from "../api/notifications.queries";
import type { Notification } from "../types";

/** smarthub-api's socket event for a freshly created notification
 *  (`emitNotificationNew` in src/socket/emit.ts). */
const NOTIFICATION_NEW_EVENT = "notification:new";

/**
 * Where a notification's `actionUrl` should take the user. In-app paths
 * ("/payments", "/assignments/:id") route client-side; an absolute link
 * elsewhere (a calendar reminder's meeting link) opens in a new tab so
 * the app stays put. Anything that isn't http(s) or a rooted path is
 * dropped rather than rendered as a live link.
 */
export function notificationTarget(
  actionUrl: string | undefined,
): { href: string; external: boolean } | null {
  const value = actionUrl?.trim();
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) {
    return { href: value, external: false };
  }
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return { href: url.href, external: true };
    }
  } catch {
    // Not a URL at all.
  }
  return null;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  const { data: notifications } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markReadMutation = useMarkRead();
  const markAllReadMutation = useMarkAllRead();

  const socket = useSocket();
  const queryClient = useQueryClient();
  const chime = useNotificationChime();
  // Flash the tab title when unread notifications land while the user
  // is on another tab.
  useTitleNotifier(unreadCount);

  // Live updates: the unread count is derived from the list query, so
  // invalidating the list refreshes both the badge and the dropdown.
  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.all });
      chime();
    };
    socket.on(NOTIFICATION_NEW_EVENT, handler);
    return () => {
      socket.off(NOTIFICATION_NEW_EVENT, handler);
    };
  }, [socket, queryClient, chime]);

  const handleItemClick = (n: Notification) => {
    if (!n.read) markReadMutation.mutate(n.id);
    if (notificationTarget(n.actionUrl)) setOpen(false);
  };

  const items = (notifications || []).slice(0, 5);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-[0.96] transition-[transform,background-color]"
            aria-label={
              unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
            }
          />
        }
      >
        <Bell className="h-4 w-4 stroke-[1.8]" />
        <AnimatePresence>
          {unreadCount > 0 && (
            // Contextual icon animation (better-ui): opacity + scale +
            // blur, exact values (0.25→1, 4px→0px) — never a plain
            // visibility toggle for a badge that comes and goes.
            <motion.span
              key="unread-badge"
              initial={reduce ? false : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              className="absolute -top-0.5 -right-0.5"
            >
              <Badge className="bg-accent text-accent-foreground font-bold text-[10px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center p-0 border-2 border-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            </motion.span>
          )}
        </AnimatePresence>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 sm:w-96 p-0 rounded-2xl shadow-md">
        {/* Header */}
        <div className="p-3 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="font-semibold text-xs text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] rounded-full">
                {unreadCount} new
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => markAllReadMutation.mutate()}
              className="text-[11px] text-muted-foreground hover:text-primary rounded-lg"
            >
              <CheckCheck className="mr-1 h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <ul className="divide-y max-h-80 overflow-y-auto scrollbar-none">
          {items.length > 0 ? (
            items.map((n) => {
              const style = notificationTypeStyle(n.type);
              const Icon = style.icon;
              const target = notificationTarget(n.actionUrl);
              const rowClassName = cn(
                "block w-full p-3 text-left text-xs space-y-1 transition-colors outline-none focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                !n.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/40",
              );
              const content = (
                <>
                  <span className="flex items-center gap-2 justify-between">
                    <span className="flex min-w-0 items-center gap-2 font-semibold text-foreground">
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                          style.className,
                        )}
                      >
                        <Icon className="h-3 w-3" aria-hidden />
                      </span>
                      <span className="truncate">{n.title}</span>
                      {!n.read && <span className="sr-only">(unread)</span>}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </span>
                  {n.body && (
                    <span className="block text-[11px] text-muted-foreground line-clamp-2 leading-relaxed pl-7">
                      {n.body}
                    </span>
                  )}
                </>
              );
              return (
                <li key={n.id}>
                  {target?.external ? (
                    <a
                      href={target.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleItemClick(n)}
                      className={rowClassName}
                    >
                      {content}
                    </a>
                  ) : target ? (
                    <Link
                      href={target.href}
                      onClick={() => handleItemClick(n)}
                      className={rowClassName}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className={cn(rowClassName, "cursor-pointer")}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })
          ) : (
            <li className="text-xs text-muted-foreground text-center py-6">
              No notifications yet.
            </li>
          )}
        </ul>

        {/* Footer */}
        <div className="p-2 border-t bg-muted/20 text-center">
          <Button
            nativeButton={false} render={<Link href="/notifications" onClick={() => setOpen(false)} />}
            variant="ghost"
            size="xs"
            className="w-full text-xs text-primary font-medium rounded-xl"
          >
            View all notifications →
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
