"use client";

import { useState } from "react";
import { Activity as ActivityIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Ledger, LedgerItem } from "@/components/ui/ledger";
import { pluralize } from "@/lib/utils";
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
    const dayStr = new Date(event.createdAt).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const existing = groupedMap.get(dayStr) || [];
    existing.push(event);
    groupedMap.set(dayStr, existing);
  }

  const dateline = new Date().toLocaleDateString("en-GB", {
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
              <strong className="text-foreground">{meta.total}</strong> {pluralize(meta.total, "account action", undefined, false)}.
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
                <Ledger key={dayStr} title={dayStr} count={dayEvents.length}>
                  {dayEvents.map((event) => {
                    const style = actionTypeStyle(event.action);
                    const Icon = style.icon;
                    const timeStr = new Date(event.createdAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <LedgerItem
                        key={event.id}
                        icon={Icon}
                        iconClassName={style.className}
                        title={style.label}
                        meta={
                          <div className="flex flex-wrap items-center gap-2">
                            {event.resource?.label && (
                              <span>
                                Target: <strong className="font-medium text-foreground">{event.resource.label}</strong>
                              </span>
                            )}
                            {event.ip && (
                              <span className="font-mono text-[10px] text-muted-foreground">
                                · {event.ip}
                              </span>
                            )}
                          </div>
                        }
                        when={timeStr}
                      />
                    );
                  })}
                </Ledger>
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
