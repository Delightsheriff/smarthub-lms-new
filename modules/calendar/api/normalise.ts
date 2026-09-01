import type { ApiCalendarEvent, CalendarEventUI } from "../types";

export const TYPE_MAP: Record<
  string,
  { label: string; tone: "primary" | "accent" | "blue" | "amber" | "violet" | "muted" }
> = {
  "class-session": { label: "Class", tone: "blue" },
  "assignment-due": { label: "Due", tone: "amber" },
  "material-reminder": { label: "Material", tone: "accent" },
  "office-hours": { label: "Office Hours", tone: "violet" },
  announcement: { label: "Announcement", tone: "primary" },
  general: { label: "Event", tone: "muted" },
};

export function normaliseEvent(api: ApiCalendarEvent): CalendarEventUI {
  const typeConfig = TYPE_MAP[api.type] || {
    label: api.type || "Event",
    tone: "muted",
  };

  const startDate = new Date(api.start);
  const endDate = api.end ? new Date(api.end) : undefined;

  return {
    id: api._id,
    type: api.type,
    title: api.title,
    description: api.description,
    link: api.link,
    location: api.location,
    start: startDate,
    end: endDate,
    allDay: !!api.allDay,
    typeLabel: typeConfig.label,
    typeTone: typeConfig.tone,
    isCancelled: !!api.isCancelled,
    scope: api.scope,
    scopeId: api.scopeId,
    sourceId: api.sourceRef?.id,
    courseName: api.meta?.courseName,
    moduleTitle: api.meta?.moduleTitle,
  };
}
