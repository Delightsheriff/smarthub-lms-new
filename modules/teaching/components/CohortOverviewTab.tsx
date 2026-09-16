"use client";

import React from "react";
import { BookOpen, Users, Award, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TeachingCohortDetail } from "../types";

interface CohortOverviewTabProps {
  cohort: TeachingCohortDetail;
}

export function CohortOverviewTab({ cohort }: CohortOverviewTabProps) {
  const totalModules = cohort.modules.length;
  const totalAssignments = cohort.modules.reduce((acc, m) => acc + (m.assignmentCount || 0), 0);
  const totalRecordings = cohort.modules.reduce((acc, m) => acc + (m.recordingCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Enrolled Students</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-bold text-foreground tabular-nums">{cohort.studentCount}</div>
        </Card>

        <Card className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Total Modules</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-bold text-foreground tabular-nums">{totalModules}</div>
        </Card>

        <Card className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Assigned Tasks</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-bold text-foreground tabular-nums">{totalAssignments}</div>
        </Card>

        <Card className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Recorded Sessions</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/10 text-success">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-bold text-foreground tabular-nums">{totalRecordings}</div>
        </Card>
      </div>

      {/* Progress & Description Card */}
      <Card className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <CardHeader className="p-0 border-b border-border pb-3">
          <CardTitle className="font-display text-base font-semibold">Course Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          {cohort.course.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {cohort.course.description}
            </p>
          )}

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Delivery Progress</span>
              <span className="tabular-nums">{cohort.progress}%</span>
            </div>
            <Progress value={cohort.progress} className="h-2 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
