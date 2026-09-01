"use client";

import React from "react";
import { Clock } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import {
  isSameDay,
  formatHourLabel,
  calculateEventPosition,
} from "./grid-utils";
import type { CalendarEventUI } from "../types";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEventUI[];
  hiddenScopes?: Set<string>;
  onEventClick?: (event: CalendarEventUI) => void;
  dayStartHour?: number;
  totalHours?: number;
}

export function DayView({
  currentDate,
  events,
  hiddenScopes,
  onEventClick,
  dayStartHour = 8,
  totalHours = 12,
}: DayViewProps) {
  const hours = Array.from({ length: totalHours }, (_, i) => dayStartHour + i);

  const dayEvents = events.filter((e) => {
    if (hiddenScopes) {
      const scopeKey = e.scopeId || e.scope || "global";
      if (hiddenScopes.has(scopeKey)) return false;
    }
    return isSameDay(e.start, currentDate);
  });

  const getToneClass = (tone: CalendarEventUI["typeTone"]) => {
    switch (tone) {
      case "blue":
        return "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200";
      case "amber":
        return "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200";
      case "violet":
        return "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200";
      case "accent":
        return "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200";
      case "primary":
        return "bg-primary/10 text-primary border-primary/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="w-full border rounded-2xl bg-card overflow-hidden shadow-sm flex flex-col">
      {/* Day header */}
      <div className="border-b bg-muted/40 p-3 text-center">
        <h3 className="text-base font-bold text-foreground">
          {currentDate.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h3>
        <p className="text-xs text-muted-foreground">
          {dayEvents.length} scheduled event{dayEvents.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Timetable grid body */}
      <div className="relative grid grid-cols-6 divide-x min-h-[480px]">
        {/* Hour labels column */}
        <div className="col-span-1 flex flex-col justify-between py-2 text-xs text-muted-foreground text-center bg-muted/10 font-mono">
          {hours.map((hour) => (
            <div key={hour} className="h-10 border-b/40 flex items-center justify-center">
              {formatHourLabel(hour)}
            </div>
          ))}
        </div>

        {/* Timetable main column */}
        <div className="col-span-5 relative h-full border-b">
          {hours.map((h) => (
            <div key={h} className="h-10 border-b border-muted/30" />
          ))}

          {dayEvents.map((event) => {
            const { topPercent, heightPercent } = calculateEventPosition(
              event.start,
              event.end,
              dayStartHour,
              totalHours,
            );

            return (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                style={{
                  top: `${topPercent}%`,
                  height: `${heightPercent}%`,
                }}
                className={cn(
                  "absolute inset-x-2 rounded-xl border p-2.5 cursor-pointer text-xs transition-opacity hover:opacity-90 overflow-hidden shadow-xs space-y-0.5",
                  getToneClass(event.typeTone),
                  event.isCancelled && "line-through opacity-60",
                )}
              >
                <div className="font-bold truncate text-xs">{event.title}</div>
                <div className="flex items-center gap-1 text-[11px] opacity-80">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{formatDateTime(event.start.toISOString())}</span>
                </div>
                {event.description && (
                  <p className="text-[11px] opacity-75 truncate">{event.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
