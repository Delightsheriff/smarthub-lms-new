"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock, AlertTriangle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { htmlToPlainText } from "@/lib/utils";
import { CountdownToDeadline } from "./countdown-to-deadline";
import type { Assignment } from "../types";
import type { Course } from "@/modules/courses/types";
import type { Module } from "@/modules/learning/types";

interface AssignmentListCardProps {
  assignment: Assignment;
  course?: Course;
  module?: Module;
}

export function AssignmentListCard({
  assignment,
  course,
  module,
}: AssignmentListCardProps) {
  const getStatusBadge = () => {
    switch (assignment.status) {
      case "graded":
        // "Reviewed", not "Graded" — points/scores are hidden from
        // students (see grade-card.tsx), so the language shouldn't
        // imply a number is waiting to be seen.
        return (
          <Badge variant="success" className="text-[11px] font-medium shrink-0">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Reviewed
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="outline" className="border-primary/40 text-primary text-[11px] font-medium shrink-0">
            <Clock className="mr-1 h-3 w-3" /> Submitted
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive" className="text-[11px] font-medium shrink-0">
            <AlertTriangle className="mr-1 h-3 w-3" /> Overdue
          </Badge>
        );
      case "draft":
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground text-[11px] font-medium shrink-0">
            <FileText className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  const getPriorityBadge = () => {
    if (assignment.priority === "high") {
      return (
        <Badge variant="destructive" className="text-[10px] shrink-0">
          High Priority
        </Badge>
      );
    }
    return null;
  };

  const plainInstructions = htmlToPlainText(assignment.instructions);

  return (
    <Card className="rounded-2xl border border-border bg-card hover:border-primary/40 active:scale-[0.99] transition-[border-color,box-shadow,transform] duration-150 ease-[var(--ease-out-strong)] shadow-xs overflow-hidden group flex flex-col justify-between">
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3.5">
        <div className="space-y-2.5 min-w-0">
          {/* Context header: Course & Module */}
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="font-medium truncate text-foreground/80">
                {course?.name || "Course"}
              </span>
              <span className="text-muted-foreground/40 shrink-0">·</span>
              <span className="truncate text-muted-foreground">
                {module?.title || "Module"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {getPriorityBadge()}
              {getStatusBadge()}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display text-base font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">
            {assignment.title}
          </h3>

          {/* Instructions snippet (HTML-stripped) */}
          {plainInstructions && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {plainInstructions}
            </p>
          )}
        </div>

        {/* Card footer details */}
        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 mt-auto">
          <CountdownToDeadline dueAt={assignment.dueAt} className="text-[11px]" />

          <Button
            nativeButton={false} render={<Link href={`/assignments/${assignment.id}`} />}
            size="sm"
            variant="ghost"
            className="h-8 rounded-xl px-2.5 text-xs group-hover:translate-x-0.5 transition-transform text-foreground/80 hover:text-foreground shrink-0 ml-auto sm:ml-0"
          >
            View Detail <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
