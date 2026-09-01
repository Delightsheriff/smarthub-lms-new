import type { NotificationType } from "./api.types";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}
