import {
  Activity,
  CreditCard,
  FileCheck,
  GraduationCap,
  KeyRound,
  LogIn,
  LogOut,
  RefreshCw,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

/** One source of truth for "what does this action look like" — was a
 *  getActionInfo() switch inline in MyActivityPageContent with five
 *  raw Tailwind colors (text-blue-600, text-emerald-600, etc). Routes
 *  through real theme tokens instead. A different vocabulary from
 *  notifications' type styling (auth/submission/payment events, not
 *  grade/material/announcement) — its own module, not a shared one
 *  forced across two unrelated domains. */
export interface ActionTypeStyle {
  label: string;
  icon: LucideIcon;
  className: string;
}

const STYLES: Record<string, ActionTypeStyle> = {
  "auth.login": {
    label: "Signed into portal",
    icon: LogIn,
    className: "text-primary bg-primary/10",
  },
  "auth.logout": {
    label: "Signed out of portal",
    icon: LogOut,
    className: "text-muted-foreground bg-muted",
  },
  "auth.password.change": {
    label: "Changed your password",
    icon: KeyRound,
    className: "text-primary bg-primary/10",
  },
  "auth.password.reset.request": {
    label: "Requested a password reset",
    icon: KeyRound,
    className: "text-warning bg-warning/10",
  },
  "auth.password.reset.complete": {
    label: "Reset your password",
    icon: KeyRound,
    className: "text-primary bg-primary/10",
  },
  "enrolment.create": {
    label: "Enrolled in a course",
    icon: GraduationCap,
    className: "text-success bg-success/10",
  },
  "submission.submit": {
    label: "Submitted assignment work",
    icon: FileCheck,
    className: "text-success bg-success/10",
  },
  "submission.resubmit": {
    label: "Resubmitted assignment work",
    icon: RefreshCw,
    className: "text-accent bg-accent/10",
  },
  "payment.create": {
    label: "Completed payment transaction",
    icon: CreditCard,
    className: "text-accent bg-accent/10",
  },
  "profile.update": {
    label: "Updated profile details",
    icon: UserCheck,
    className: "text-primary bg-primary/10",
  },
};

const DEFAULT_STYLE = (action: string): ActionTypeStyle => ({
  label: action.replace(".", " "),
  icon: Activity,
  className: "text-primary bg-primary/10",
});

export function actionTypeStyle(action: string): ActionTypeStyle {
  return STYLES[action] ?? DEFAULT_STYLE(action);
}
