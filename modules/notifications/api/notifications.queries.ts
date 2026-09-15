"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "./notifications.service";
import { normaliseNotification } from "./normalise";
import type { Notification } from "../types";

export const NOTIFICATIONS_QUERY_KEYS = {
  all: ["notifications", "list"] as const,
} as const;

const fetchNotifications = async (): Promise<Notification[]> => {
  const raw = await notificationsService.getNotifications();
  return (raw || []).map((n) => normaliseNotification(n));
};

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: NOTIFICATIONS_QUERY_KEYS.all,
    queryFn: fetchNotifications,
  });
}

/** Derived from the same list query (shares its cache — no extra
 *  request). There is no server-side unread-count endpoint; smarthub-api
 *  only ever returns the full list, same as the legacy app. */
export function useUnreadCount() {
  return useQuery<Notification[], unknown, number>({
    queryKey: NOTIFICATIONS_QUERY_KEYS.all,
    queryFn: fetchNotifications,
    select: (notifications) => notifications.filter((n) => !n.read).length,
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
    },
  });
}
