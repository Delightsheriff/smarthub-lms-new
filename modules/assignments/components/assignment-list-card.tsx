"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock, AlertTriangle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Graded
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Clock className="mr-1 h-3 w-3" /> Submitted
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" /> Overdue
          </Badge>
        );
      case "draft":
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <FileText className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  const getPriorityBadge = () => {
    if (assignment.priority === "high") {
      return (
        <Badge variant="outline" className="border-red-500/40 text-red-700 dark:text-red-300 text-[10px]">
          High Priority
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-2xl border bg-card hover:border-primary/40 transition-all duration-200 shadow-sm overflow-hidden group">
      <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
        <div className="space-y-2">
          {/* Context header: Course & Module */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 truncate max-w-[70%]">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="font-medium truncate">
                {course?.name || "Course"}
              </span>
              <span>·</span>
              <span className="truncate">{module?.title || "Module"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {getPriorityBadge()}
              {getStatusBadge()}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {assignment.title}
          </h3>

          {/* Instructions snippet */}
          {assignment.instructions && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {assignment.instructions}
            </p>
          )}
        </div>

        {/* Card footer details */}
        <div className="pt-2 border-t flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-semibold">
              {assignment.totalPoints} pts
            </Badge>
            <CountdownToDeadline dueAt={assignment.dueAt} />
          </div>

          <Button
            render={<Link href={`/assignments/${assignment.id}`} />}
            size="sm"
            variant="ghost"
            className="rounded-xl group-hover:translate-x-0.5 transition-transform"
          >
            View Detail <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
