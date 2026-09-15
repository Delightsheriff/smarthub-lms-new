"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { useStudentCalendar } from "../api/calendar.queries";
import { MonthGrid } from "./MonthGrid";
import { WeekGrid } from "./WeekGrid";
import { DayView } from "./DayView";
import { CourseFilterChips } from "./CourseFilterChips";
import { EventDetailDialog } from "./EventDetailDialog";
import type { CalendarEventUI } from "../types";

type ViewMode = "month" | "week" | "day" | "agenda";
const VALID_VIEWS: ViewMode[] = ["month", "week", "day", "agenda"];

export function CalendarPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  // ?view= persists in the URL so a refresh/deep-link restores the
  // active view instead of always resetting to Month.
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const fromUrl = searchParams.get("view");
    return fromUrl && VALID_VIEWS.includes(fromUrl as ViewMode) ? (fromUrl as ViewMode) : "month";
  });
  const [hiddenScopes, setHiddenScopes] = useState<Set<string>>(() => new Set());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventUI | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: events, isLoading, error } = useStudentCalendar();

  const handleViewChange = (next: ViewMode) => {
    setViewMode(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") next.setMonth(next.getMonth() - 1);
    else if (viewMode === "week") next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") next.setMonth(next.getMonth() + 1);
    else if (viewMode === "week") next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleToggleScope = (scopeKey: string) => {
    setHiddenScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scopeKey)) next.delete(scopeKey);
      else next.add(scopeKey);
      return next;
    });
  };

  const handleEventClick = (event: CalendarEventUI) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const filteredEvents = (events || []).filter((e) => {
    const scopeKey = e.scopeId || e.scope || "global";
    return !hiddenScopes.has(scopeKey);
  });

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <PageHeader
        title="Academic Calendar"
        description="Class sessions, assignment deadlines, office hours, and academic events."
        actions={
          <Tabs value={viewMode} onValueChange={(v) => handleViewChange(v as ViewMode)}>
            <TabsList className="rounded-xl bg-muted/60 p-1">
              <TabsTrigger value="month" className="rounded-lg text-xs">Month</TabsTrigger>
              <TabsTrigger value="week" className="rounded-lg text-xs">Week</TabsTrigger>
              <TabsTrigger value="day" className="rounded-lg text-xs">Day</TabsTrigger>
              <TabsTrigger value="agenda" className="rounded-lg text-xs">Agenda</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {/* Date Navigator Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday} className="rounded-xl">
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handlePrev}
              className="rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleNext}
              className="rounded-xl"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-base font-semibold text-foreground ml-2">
            {currentDate.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
              ...(viewMode === "day" && { day: "numeric" }),
            })}
          </h2>
        </div>

        {/* Filter chips */}
        <CourseFilterChips
          events={events || []}
          hiddenScopes={hiddenScopes}
          onToggleScope={handleToggleScope}
        />
      </div>

      {/* Loading state */}
      {isLoading && <Skeleton className="h-[480px] w-full rounded-2xl" />}

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-destructive">
            Failed to load calendar events. Please try again.
          </p>
        </div>
      )}

      {/* Main Grid View */}
      {!isLoading && !error && (
        <>
          {viewMode === "month" && (
            <MonthGrid
              year={currentDate.getFullYear()}
              month={currentDate.getMonth()}
              events={filteredEvents}
              hiddenScopes={hiddenScopes}
              onEventClick={handleEventClick}
              onDaySelect={(d) => {
                setCurrentDate(d);
                setViewMode("day");
              }}
            />
          )}

          {viewMode === "week" && (
            <WeekGrid
              currentDate={currentDate}
              events={filteredEvents}
              hiddenScopes={hiddenScopes}
              onEventClick={handleEventClick}
            />
          )}

          {viewMode === "day" && (
            <DayView
              currentDate={currentDate}
              events={filteredEvents}
              hiddenScopes={hiddenScopes}
              onEventClick={handleEventClick}
            />
          )}

          {viewMode === "agenda" && (
            <div className="space-y-3">
              {filteredEvents.length > 0 ? (
                filteredEvents
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .map((event) => (
                    <Card
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="rounded-2xl border bg-card hover:border-primary/40 transition-colors cursor-pointer shadow-xs"
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {event.typeLabel}
                            </Badge>
                            <span className="font-semibold text-sm text-foreground">
                              {event.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              <span>{formatDateTime(event.start.toISOString())}</span>
                            </div>
                            {event.courseName && (
                              <span>· {event.courseName}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground text-sm">
                  No events found for the selected view.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Shared Event Detail Modal */}
      <EventDetailDialog
        event={selectedEvent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
