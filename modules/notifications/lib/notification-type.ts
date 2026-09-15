import { Award, Bell, BookOpen, Megaphone, type LucideIcon } from "lucide-react";

/** One source of truth for "what does this notification type look
 *  like" — previously duplicated near-identically in NotificationBell
 *  and NotificationsPageContent, each with its own raw Tailwind
 *  colors (text-emerald-600, text-blue-600, text-amber-600). Routes
 *  through real theme tokens so both surfaces move together. */
export interface NotificationTypeStyle {
  icon: LucideIcon;
  /** Icon + its tinted chip background. */
  className: string;
}

const STYLES: Record<string, NotificationTypeStyle> = {
  grade: { icon: Award, className: "text-success bg-success/10" },
  material: { icon: BookOpen, className: "text-primary bg-primary/10" },
  announcement: { icon: Megaphone, className: "text-accent bg-accent/10" },
};

const DEFAULT_STYLE: NotificationTypeStyle = {
  icon: Bell,
  className: "text-primary bg-primary/10",
};

export function notificationTypeStyle(type: string): NotificationTypeStyle {
  return STYLES[type] ?? DEFAULT_STYLE;
}
