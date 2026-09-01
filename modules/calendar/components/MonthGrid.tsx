"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { getMonthDays, isSameDay } from "./grid-utils";
import type { CalendarEventUI } from "../types";

interface MonthGridProps {
  year: number;
  month: number;
  events: CalendarEventUI[];
  hiddenScopes?: Set<string>;
  onEventClick?: (event: CalendarEventUI) => void;
  onDaySelect?: (date: Date) => void;
  selectedDate?: Date;
  compact?: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthGrid({
  year,
  month,
  events,
  hiddenScopes,
  onEventClick,
  onDaySelect,
  selectedDate,
  compact = false,
}: MonthGridProps) {
  const days = getMonthDays(year, month);

  const getToneClass = (tone: CalendarEventUI["typeTone"]) => {
    switch (tone) {
      case "blue":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
      case "amber":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
      case "violet":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300";
      case "accent":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
      case "primary":
        return "bg-primary/15 text-primary font-medium";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="w-full border rounded-2xl bg-card overflow-hidden shadow-sm">
      {/* Weekdays header */}
      <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-semibold text-muted-foreground py-2">
        {WEEKDAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Grid cells */}
      <div className="grid grid-cols-7 divide-x divide-y">
        {days.map(({ date, isCurrentMonth, isToday }, idx) => {
          const dayEvents = events.filter((e) => {
            if (hiddenScopes) {
              const scopeKey = e.scopeId || e.scope || "global";
              if (hiddenScopes.has(scopeKey)) return false;
            }
            return isSameDay(e.start, date);
          });

          const isSelected = selectedDate ? isSameDay(selectedDate, date) : false;

          return (
            <div
              key={idx}
              onClick={() => onDaySelect?.(date)}
              className={cn(
                "p-1.5 transition-colors cursor-pointer flex flex-col justify-between",
                compact ? "min-h-[64px]" : "min-h-[100px]",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground/50",
                isSelected && "ring-2 ring-primary ring-inset bg-primary/5",
              )}
            >
              {/* Day header */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-semibold h-6 w-6 rounded-full inline-flex items-center justify-center",
                    isToday
                      ? "bg-primary text-primary-foreground font-bold"
                      : isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground/60",
                  )}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && compact && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>

              {/* Event pills (Full mode) */}
              {!compact && (
                <div className="mt-1 space-y-1 overflow-y-auto max-h-[70px] scrollbar-none">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-md truncate cursor-pointer font-medium hover:opacity-80 transition-opacity",
                        getToneClass(event.typeTone),
                        event.isCancelled && "line-through opacity-60",
                      )}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-muted-foreground font-medium pl-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
