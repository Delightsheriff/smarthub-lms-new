"use client";

import React from "react";
import { BookOpen, Users, Award, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatTile } from "@/components/ui/stat-tile";
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
        <StatTile
          label="Enrolled Students"
          value={cohort.studentCount}
          icon={<Users className="h-4 w-4" />}
          tone="primary"
        />
        <StatTile
          label="Total Modules"
          value={totalModules}
          icon={<BookOpen className="h-4 w-4" />}
          tone="primary"
        />
        <StatTile
          label="Assigned Tasks"
          value={totalAssignments}
          icon={<Award className="h-4 w-4" />}
          tone="accent"
        />
        <StatTile
          label="Recorded Sessions"
          value={totalRecordings}
          icon={<Clock className="h-4 w-4" />}
          tone="success"
        />
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
