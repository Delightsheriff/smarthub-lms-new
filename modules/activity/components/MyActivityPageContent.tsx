"use client";

import React, { useState } from "react";
import {
  Activity,
  LogIn,
  LogOut,
  FileCheck,
  RefreshCw,
  CreditCard,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { useMyActivity } from "../api/activity.queries";
import type { ActivityEvent } from "../types";

export function getActionInfo(action: string) {
  switch (action) {
    case "auth.login":
      return { label: "Signed into portal", icon: LogIn, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50" };
    case "auth.logout":
      return { label: "Signed out of portal", icon: LogOut, color: "text-muted-foreground bg-muted" };
    case "submission.submit":
      return { label: "Submitted assignment work", icon: FileCheck, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" };
    case "submission.resubmit":
      return { label: "Resubmitted assignment work", icon: RefreshCw, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50" };
    case "payment.create":
      return { label: "Completed payment transaction", icon: CreditCard, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" };
    case "profile.update":
      return { label: "Updated profile details", icon: UserCheck, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" };
    default:
      return { label: action.replace(".", " "), icon: Activity, color: "text-primary bg-primary/10" };
  }
}

export function MyActivityPageContent() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyActivity(page);

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

  const groupedEntries = Array.from(groupedMap.entries());

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Activity Log
        </h1>
        <p className="text-sm text-muted-foreground">
          A security and audit timeline of your recent account actions, submissions, and payments.
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-destructive">
            Failed to load activity log. Please try again later.
          </p>
        </div>
      )}

      {/* Activity Timeline List */}
      {!isLoading && !error && (
        <>
          {groupedEntries.length > 0 ? (
            <div className="space-y-6">
              {groupedEntries.map(([dayStr, dayEvents]) => (
                <div key={dayStr} className="space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground tracking-wide">
                    {dayStr}
                  </div>

                  <div className="space-y-2">
                    {dayEvents.map((event) => {
                      const actionInfo = getActionInfo(event.action);
                      const Icon = actionInfo.icon;

                      return (
                        <Card
                          key={event.id}
                          className="rounded-2xl border bg-card hover:border-primary/30 transition-colors shadow-xs"
                        >
                          <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${actionInfo.color}`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>

                              <div className="space-y-0.5 min-w-0">
                                <div className="font-semibold text-sm text-foreground truncate">
                                  {actionInfo.label}
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
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Pagination controls */}
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
            <div className="rounded-2xl border bg-card p-12 text-center space-y-2 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="text-base font-semibold text-foreground">No Activity Records</h3>
              <p className="text-xs">Your activity history is currently empty.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
