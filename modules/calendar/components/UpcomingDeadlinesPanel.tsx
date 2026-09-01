"use client";

import React from "react";
import Link from "next/link";
import { Clock, ArrowRight, BookOpen, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpcomingDeadlines } from "@/modules/assignments/api/assignments.queries";
import { CountdownToDeadline } from "@/modules/assignments/components/countdown-to-deadline";

interface UpcomingDeadlinesPanelProps {
  limit?: number;
}

export function UpcomingDeadlinesPanel({ limit = 3 }: UpcomingDeadlinesPanelProps) {
  const { data: upcoming, isLoading } = useUpcomingDeadlines(limit);

  return (
    <Card className="rounded-2xl border bg-card shadow-sm h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
        </div>
        <Button
          render={<Link href="/assignments" />}
          size="sm"
          variant="ghost"
          className="rounded-xl text-xs"
        >
          All Tasks <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        )}

        {!isLoading && (
          <div className="space-y-2.5">
            {upcoming && upcoming.length > 0 ? (
              upcoming.map(({ assignment, course, module }) => (
                <div
                  key={assignment.id}
                  className="p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {assignment.title}
                    </span>
                    <CountdownToDeadline dueAt={assignment.dueAt} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1 truncate max-w-[70%]">
                      <BookOpen className="h-3 w-3 shrink-0 text-primary" />
                      <span className="truncate">{course?.name || "Course"}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {assignment.totalPoints} pts
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center py-6 space-y-1">
                <AlertCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                <p>No upcoming assignment deadlines.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
