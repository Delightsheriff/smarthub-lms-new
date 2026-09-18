"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDateTime } from "@/lib/utils";
import { notificationTypeStyle } from "../lib/notification-type";
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
} from "../api/notifications.queries";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  const { data: notifications } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markReadMutation = useMarkRead();
  const markAllReadMutation = useMarkAllRead();

  const handleItemClick = (id: string, read: boolean) => {
    if (!read) {
      markReadMutation.mutate(id);
    }
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
            aria-label="Notifications"
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
              <Badge className="bg-accent text-white font-bold text-[10px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center p-0 border-2 border-background">
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
        <div className="divide-y max-h-80 overflow-y-auto scrollbar-none">
          {items.length > 0 ? (
            items.map((n) => {
              const style = notificationTypeStyle(n.type);
              const Icon = style.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n.id, n.read)}
                  className={cn(
                    "p-3 transition-colors cursor-pointer text-xs space-y-1",
                    !n.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex min-w-0 items-center gap-2 font-semibold text-foreground">
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                          style.className,
                        )}
                      >
                        <Icon className="h-3 w-3" />
                      </span>
                      <span className="truncate">{n.title}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>
                  {n.body && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed pl-7">
                      {n.body}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">
              No notifications yet.
            </p>
          )}
        </div>

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
