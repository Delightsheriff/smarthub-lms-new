"use client";

import React, { useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ledger, LedgerItem } from "@/components/ui/ledger";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { useStudentCalendar } from "../api/calendar.queries";
import { MonthGrid } from "./MonthGrid";
import { WeekGrid } from "./WeekGrid";
import { DayView } from "./DayView";
import { CourseFilterChips } from "./CourseFilterChips";
import { EventDetailDialog } from "./EventDetailDialog";
import { getWeekDays } from "./grid-utils";
import type { CalendarEventUI } from "../types";

type ViewMode = "month" | "week" | "day" | "agenda";
const VALID_VIEWS: ViewMode[] = ["month", "week", "day", "agenda"];
type AgendaWindow = 7 | 14 | 30;
const AGENDA_WINDOWS: AgendaWindow[] = [7, 14, 30];

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
  const [agendaWindow, setAgendaWindow] = useState<AgendaWindow>(14);

  // Query window depends on the active view, so an event doesn't
  // silently sit outside the fetched range — a fixed 9-month blob
  // (the previous default) would still miss anything further out.
  //   month:  the visible month + a 7-day buffer for spill cells
  //   week:   the same Sunday-start week WeekGrid renders
  //   day:    just the 24h shown
  //   agenda: a rolling window from today, sized by agendaWindow
  const { from, to } = useMemo(() => {
    if (viewMode === "month") {
      const f = new Date(currentDate);
      f.setDate(1);
      f.setDate(f.getDate() - 7);
      const t = new Date(currentDate);
      t.setDate(1);
      t.setMonth(t.getMonth() + 1);
      t.setDate(t.getDate() + 7);
      return { from: f, to: t };
    }
    if (viewMode === "week") {
      const days = getWeekDays(currentDate);
      const f = new Date(days[0].date);
      f.setHours(0, 0, 0, 0);
      const t = new Date(days[6].date);
      t.setHours(23, 59, 59, 999);
      return { from: f, to: t };
    }
    if (viewMode === "day") {
      const f = new Date(currentDate);
      f.setHours(0, 0, 0, 0);
      const t = new Date(f);
      t.setDate(t.getDate() + 1);
      return { from: f, to: t };
    }
    const f = new Date();
    f.setHours(0, 0, 0, 0);
    const t = new Date(f);
    t.setDate(t.getDate() + agendaWindow);
    return { from: f, to: t };
  }, [viewMode, currentDate, agendaWindow]);

  const {
    data: events,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useStudentCalendar({ from: from.toISOString(), to: to.toISOString() });

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

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        divider
        dateline={`${dateline} · Academic Schedule`}
        title="Academic Calendar"
        description={
          events && events.length > 0 ? (
            <>
              Live sessions, assignment deadlines, and milestones.{" "}
              <strong className="text-foreground">{events.length}</strong> event{events.length === 1 ? "" : "s"} scheduled for this period.
            </>
          ) : (
            "Class sessions, assignment deadlines, office hours, and academic events."
          )
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => handleViewChange(v as ViewMode)}>
              <TabsList className="rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="month" className="rounded-lg text-xs">Month</TabsTrigger>
                <TabsTrigger value="week" className="rounded-lg text-xs">Week</TabsTrigger>
                <TabsTrigger value="day" className="rounded-lg text-xs">Day</TabsTrigger>
                <TabsTrigger value="agenda" className="rounded-lg text-xs">Agenda</TabsTrigger>
              </TabsList>
            </Tabs>
            <RefreshButton loading={isFetching} onClick={() => refetch()} />
          </div>
        }
      />

      {/* Date Navigator Bar — Agenda swaps this for a rolling-window
          picker, since it isn't anchored to a browsable date the way
          the other three views are. */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        {viewMode === "agenda" ? (
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-1">Next</span>
            <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1">
              {AGENDA_WINDOWS.map((w) => (
                <Button
                  key={w}
                  size="sm"
                  variant="ghost"
                  onClick={() => setAgendaWindow(w)}
                  className={
                    "rounded-lg px-2.5 text-xs h-7 " +
                    (agendaWindow === w
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "text-muted-foreground")
                  }
                >
                  {w} days
                </Button>
              ))}
            </div>
          </div>
        ) : (
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
              {currentDate.toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
                ...(viewMode === "day" && { day: "numeric" }),
              })}
            </h2>
          </div>
        )}

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
            filteredEvents.length > 0 ? (
              <Ledger
                title={`Upcoming in the next ${agendaWindow} days`}
                count={filteredEvents.length}
              >
                {filteredEvents
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .map((event) => {
                    const tone: "due" | "live" | "info" =
                      event.type === "class-session"
                        ? "live"
                        : event.type === "assignment"
                          ? "due"
                          : "info";

                    return (
                      <LedgerItem
                        key={event.id}
                        tone={tone}
                        title={
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-sm">
                              {event.title}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                              · {event.typeLabel}
                            </span>
                          </div>
                        }
                        meta={
                          event.courseName ? (
                            <span>{event.courseName}</span>
                          ) : null
                        }
                        when={formatDateTime(event.start.toISOString())}
                        onClick={() => handleEventClick(event)}
                      />
                    );
                  })}
              </Ledger>
            ) : (
              <EmptyState
                icon={CalendarRange}
                title="Nothing in this window"
                description={
                  viewMode === "agenda"
                    ? `No events in the next ${agendaWindow} days. Try a wider window.`
                    : "No events found for the selected view."
                }
              />
            )
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
