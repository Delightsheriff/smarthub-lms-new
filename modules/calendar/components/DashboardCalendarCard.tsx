"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, pluralize } from "@/lib/utils";
import { useStudentCalendar } from "../api/calendar.queries";
import { MonthGrid } from "./MonthGrid";
import { isSameDay } from "./grid-utils";
import { EventDetailDialog } from "./EventDetailDialog";
import type { CalendarEventUI } from "../types";

export function DashboardCalendarCard() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventUI | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: events, isLoading } = useStudentCalendar();

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm h-full flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-7 w-20 rounded-xl" />
        </div>
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </Card>
    );
  }

  const dayEvents = (events || []).filter((e) => isSameDay(e.start, selectedDate));

  const handleEventClick = (event: CalendarEventUI) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <CardTitle className="font-display text-base font-semibold">Calendar & Schedule</CardTitle>
        </div>
        <Button
          nativeButton={false} render={<Link href="/calendar" />}
          size="sm"
          variant="ghost"
          className="rounded-xl text-xs"
        >
          Full View <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
        {/* Compact Month Grid */}
        <MonthGrid
          year={selectedDate.getFullYear()}
          month={selectedDate.getMonth()}
          events={events || []}
          selectedDate={selectedDate}
          onDaySelect={(d) => setSelectedDate(d)}
          compact
        />

        {/* Selected Day Event List */}
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>
              {selectedDate.toLocaleDateString("en-GB", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>{pluralize(dayEvents.length, "Event")}</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-none">
            {dayEvents.length > 0 ? (
              dayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="flex items-center justify-between p-2 rounded-xl border bg-muted/20 hover:bg-muted/40 cursor-pointer text-xs transition-colors"
                >
                  <div className="truncate pr-2">
                    <span className="font-medium text-foreground block truncate">
                      {event.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDateTime(event.start.toISOString())}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {event.typeLabel}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                No events scheduled for this day.
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <EventDetailDialog
        event={selectedEvent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}
