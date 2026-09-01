export type NotificationType =
  | "grade"
  | "material"
  | "assignment"
  | "announcement"
  | "payment"
  | "system";

export interface ApiNotification {
  _id: string;
  type: NotificationType;
  title: string;
  body?: string;
  message?: string;
  description?: string;
  createdAt: string;
  isRead?: boolean;
  read?: boolean;
  actionUrl?: string;
}
