"use client";

import { useState } from "react";
import { Activity as ActivityIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Stagger, StaggerItem } from "@/components/animation/stagger";
import { formatDateTime } from "@/lib/utils";
import { actionTypeStyle } from "../lib/action-type";
import { useMyActivity } from "../api/activity.queries";
import type { ActivityEvent } from "../types";

export function MyActivityPageContent() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error, refetch } = useMyActivity(page);

  const events = data?.events || [];
  const meta = data?.meta;

  // Group events by day string
  const groupedMap = new Map<string, ActivityEvent[]>();
  for (const event of events) {
    const dayStr = new Date(event.createdAt).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const existing = groupedMap.get(dayStr) || [];
    existing.push(event);
    groupedMap.set(dayStr, existing);
  }

  const dateline = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const groupedEntries = Array.from(groupedMap.entries());

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        divider
        dateline={`${dateline} · Security & Audit`}
        title="Activity Log"
        description={
          meta ? (
            <>
              Security and audit timeline recording{" "}
              <strong className="text-foreground">{meta.total}</strong> account action{meta.total === 1 ? "" : "s"}.
            </>
          ) : (
            "A security and audit timeline of your recent account actions, submissions, and payments."
          )
        }
        actions={<RefreshButton loading={isFetching} onClick={refetch} />}
      />

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-destructive">
            Failed to load activity log. Please try again later.
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {groupedEntries.length > 0 ? (
            <div className="space-y-6">
              {groupedEntries.map(([dayStr, dayEvents]) => (
                <div key={dayStr} className="space-y-3">
                  <h2 className="font-display text-sm font-semibold text-foreground tracking-wide">
                    {dayStr}
                  </h2>

                  <Stagger className="space-y-2">
                    {dayEvents.map((event) => {
                      const style = actionTypeStyle(event.action);
                      const Icon = style.icon;

                      return (
                        <StaggerItem key={event.id}>
                          <Card className="rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors shadow-xs">
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${style.className}`}
                                >
                                  <Icon className="h-5 w-5" />
                                </div>

                                <div className="space-y-0.5 min-w-0">
                                  <div className="font-display font-semibold text-sm text-foreground truncate">
                                    {style.label}
                                  </div>
                                  {event.resource?.label && (
                                    <div className="text-xs text-muted-foreground truncate">
                                      Target: <span className="font-medium text-foreground">{event.resource.label}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1 font-mono">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{formatDateTime(event.createdAt)}</span>
                                </div>
                                {event.ip && (
                                  <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono">
                                    {event.ip}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </StaggerItem>
                      );
                    })}
                  </Stagger>
                </div>
              ))}

              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-xs text-muted-foreground">
                    Page {meta.currentPage} of {meta.totalPages} ({meta.total} total items)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-xl"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-xl"
                    >
                      Next <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={ActivityIcon}
              title="No activity records"
              description="Your activity history is currently empty."
            />
          )}
        </>
      )}
    </div>
  );
}
