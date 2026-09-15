"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  getWeekDays,
  isSameDay,
  formatHourLabel,
  calculateEventPosition,
} from "./grid-utils";
import type { CalendarEventUI } from "../types";

interface WeekGridProps {
  currentDate: Date;
  events: CalendarEventUI[];
  hiddenScopes?: Set<string>;
  onEventClick?: (event: CalendarEventUI) => void;
  dayStartHour?: number;
  totalHours?: number;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeekGrid({
  currentDate,
  events,
  hiddenScopes,
  onEventClick,
  dayStartHour = 8,
  totalHours = 12,
}: WeekGridProps) {
  const weekDays = getWeekDays(currentDate);
  const hours = Array.from({ length: totalHours }, (_, i) => dayStartHour + i);

  // See MonthGrid's getToneClass for why the wire tone names don't map
  // 1:1 to this app's tokens.
  const getToneClass = (tone: CalendarEventUI["typeTone"]) => {
    switch (tone) {
      case "blue":
        return "bg-primary/10 text-primary border-primary/30";
      case "amber":
        return "bg-warning/10 text-warning border-warning/30";
      case "violet":
        return "bg-accent/10 text-accent border-accent/30";
      case "accent":
        return "bg-success/10 text-success border-success/30";
      case "primary":
        return "bg-primary/10 text-primary border-primary/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="w-full border rounded-2xl bg-card overflow-hidden shadow-sm flex flex-col">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b bg-muted/40 text-center py-2 text-xs font-semibold">
        <div className="text-muted-foreground border-r">Time</div>
        {weekDays.map(({ date, isToday }, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="text-[11px] text-muted-foreground">
              {WEEKDAYS[date.getDay()]}
            </span>
            <span
              className={cn(
                "h-6 w-6 rounded-full inline-flex items-center justify-center font-bold text-xs mt-0.5",
                isToday ? "bg-primary text-primary-foreground" : "text-foreground",
              )}
            >
              {date.getDate()}
            </span>
          </div>
        ))}
      </div>

      {/* Timetable grid body */}
      <div className="relative grid grid-cols-8 divide-x min-h-[480px]">
        {/* Hour labels column */}
        <div className="flex flex-col justify-between py-2 text-[11px] text-muted-foreground text-center bg-muted/10 font-mono">
          {hours.map((hour) => (
            <div key={hour} className="h-10 border-b/40 flex items-center justify-center">
              {formatHourLabel(hour)}
            </div>
          ))}
        </div>

        {/* 7 Day columns */}
        {weekDays.map(({ date }, dayIdx) => {
          const dayEvents = events.filter((e) => {
            if (hiddenScopes) {
              const scopeKey = e.scopeId || e.scope || "global";
              if (hiddenScopes.has(scopeKey)) return false;
            }
            return isSameDay(e.start, date);
          });

          return (
            <div key={dayIdx} className="relative h-full border-b">
              {/* Hour slot guidelines */}
              {hours.map((h) => (
                <div key={h} className="h-10 border-b border-muted/30" />
              ))}

              {/* Event blocks overlay */}
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
                      "absolute inset-x-1 rounded-lg border p-1.5 cursor-pointer text-xs transition-opacity hover:opacity-90 overflow-hidden shadow-xs",
                      getToneClass(event.typeTone),
                      event.isCancelled && "line-through opacity-60",
                    )}
                    title={`${event.title} (${event.typeLabel})`}
                  >
                    <div className="font-semibold truncate text-[11px] leading-tight">
                      {event.title}
                    </div>
                    {event.courseName && (
                      <div className="text-[10px] opacity-80 truncate">
                        {event.courseName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
