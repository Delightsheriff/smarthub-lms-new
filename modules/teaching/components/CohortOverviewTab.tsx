"use client";

import React from "react";
import { BookOpen, Users, Calendar, Award, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
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
        <Card className="rounded-2xl border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Enrolled Students</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{cohort.studentCount}</div>
        </Card>

        <Card className="rounded-2xl border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Modules</span>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-foreground">{totalModules}</div>
        </Card>

        <Card className="rounded-2xl border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Assigned Tasks</span>
            <Award className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-foreground">{totalAssignments}</div>
        </Card>

        <Card className="rounded-2xl border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Recorded Sessions</span>
            <Clock className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-foreground">{totalRecordings}</div>
        </Card>
      </div>

      {/* Progress & Description Card */}
      <Card className="rounded-2xl border bg-card p-6 space-y-4">
        <CardHeader className="p-0 border-b pb-3">
          <CardTitle className="text-base font-bold">Course Overview</CardTitle>
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
              <span>{cohort.progress}%</span>
            </div>
            <Progress value={cohort.progress} className="h-2.5 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
