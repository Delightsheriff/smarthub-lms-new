"use client";

import { useQuery } from "@tanstack/react-query";
import { activityService } from "./activity.service";
import type { ActivityEvent } from "../types";

export const ACTIVITY_QUERY_KEYS = {
  my: (page: number) => ["activity", "my", page] as const,
} as const;

export function useMyActivity(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ACTIVITY_QUERY_KEYS.my(page),
    queryFn: async () => {
      const res = await activityService.getMyActivity({ page, pageSize });
      const events: ActivityEvent[] = (res.data || []).map((item) => ({
        id: item._id,
        actor: item.actor,
        action: item.action,
        resource: item.resource,
        metadata: item.metadata,
        ip: item.ip,
        userAgent: item.userAgent,
        createdAt: item.createdAt,
      }));
      return {
        events,
        meta: res.meta,
      };
    },
  });
}
