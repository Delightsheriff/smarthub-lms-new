export const CALENDAR_EVENT_TYPE = {
  CLASS_SESSION: "class-session",
  ASSIGNMENT_DUE: "assignment-due",
  MATERIAL_REMINDER: "material-reminder",
  OFFICE_HOURS: "office-hours",
  ANNOUNCEMENT: "announcement",
  GENERAL: "general",
} as const;

export type CalendarEventType =
  (typeof CALENDAR_EVENT_TYPE)[keyof typeof CALENDAR_EVENT_TYPE];

export const CALENDAR_EVENT_SOURCE = {
  MANUAL: "manual",
  AUTO: "auto",
} as const;

export const CALENDAR_EVENT_SCOPE = {
  GLOBAL: "global",
  COURSE: "course",
  SCHEDULE: "schedule",
  MODULE: "module",
  ASSIGNMENT: "assignment",
} as const;

export interface ApiCalendarEvent {
  _id: string;
  type: string;
  source: "manual" | "auto";
  title: string;
  description?: string;
  link?: string;
  location?: string;
  start: string;
  end?: string;
  allDay: boolean;
  scope: "global" | "course" | "schedule" | "module" | "assignment";
  scopeId?: string;
  isCancelled: boolean;
  sourceRef?: { model: string; id: string };
  meta?: { courseName?: string; moduleTitle?: string } & Record<string, unknown>;
}

export interface CalendarEventUI {
  id: string;
  type: string;
  title: string;
  description?: string;
  link?: string;
  location?: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  typeLabel: string;
  typeTone: "primary" | "accent" | "blue" | "amber" | "violet" | "muted";
  isCancelled: boolean;
  scope?: "global" | "course" | "schedule" | "module" | "assignment";
  scopeId?: string;
  sourceId?: string;
  courseName?: string;
  moduleTitle?: string;
}
