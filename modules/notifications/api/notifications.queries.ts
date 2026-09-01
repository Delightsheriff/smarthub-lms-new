"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "./notifications.service";
import { normaliseNotification } from "./normalise";
import type { Notification } from "../types";

export const NOTIFICATIONS_QUERY_KEYS = {
  all: ["notifications", "list"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
} as const;

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: NOTIFICATIONS_QUERY_KEYS.all,
    queryFn: async () => {
      const raw = await notificationsService.getNotifications();
      return (raw || []).map((n) => normaliseNotification(n));
    },
  });
}

export function useUnreadCount() {
  const { data: notifications } = useNotifications();

  return useQuery<number>({
    queryKey: NOTIFICATIONS_QUERY_KEYS.unreadCount,
    queryFn: async () => {
      const res = await notificationsService.getUnreadCount();
      return res.count;
    },
    // Fall back to client calculation if unread endpoint returns undefined
    placeholderData: (notifications || []).filter((n) => !n.read).length,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return notificationsService.markRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.unreadCount });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return notificationsService.markAllRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.unreadCount });
    },
  });
}
