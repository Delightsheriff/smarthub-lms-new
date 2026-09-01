"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pushService } from "./push.service";
import type { NotificationPrefs } from "../types";

export const PUSH_QUERY_KEYS = {
  prefs: ["push", "prefs"] as const,
  config: ["push", "config"] as const,
} as const;

export function useNotificationPrefs() {
  return useQuery({
    queryKey: PUSH_QUERY_KEYS.prefs,
    queryFn: () => pushService.getPrefs(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateNotificationPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<NotificationPrefs>) => pushService.updatePrefs(payload),
    onSuccess: (updated) => {
      qc.setQueryData(PUSH_QUERY_KEYS.prefs, updated);
    },
  });
}
