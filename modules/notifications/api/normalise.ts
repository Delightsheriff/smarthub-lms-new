import type { ApiNotification } from "../types/api.types";
import type { Notification } from "../types";

export function normaliseNotification(api: ApiNotification): Notification {
  const body = api.body || api.message || api.description || "";
  const read = api.read ?? api.isRead ?? false;

  return {
    id: api._id,
    type: api.type,
    title: api.title,
    body,
    createdAt: api.createdAt || new Date().toISOString(),
    read,
    actionUrl: api.actionUrl,
  };
}
