"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { useTeachingCohortDetail } from "../api/teaching.queries";
import { CohortOverviewTab } from "./CohortOverviewTab";
import { CohortModulesTab } from "./CohortModulesTab";
import { CohortAssignmentsTab } from "./CohortAssignmentsTab";
import { CohortSubmissionsTab } from "./CohortSubmissionsTab";
import { CohortSessionsTab } from "./CohortSessionsTab";
import { CohortRosterTab } from "./CohortRosterTab";

interface CohortDetailPageContentProps {
  scheduleId: string;
}

export function CohortDetailPageContent({ scheduleId }: CohortDetailPageContentProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: cohort, isLoading, error } = useTeachingCohortDetail(scheduleId);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button
          render={<Link href="/teach" />}
          variant="ghost"
          size="sm"
          className="rounded-xl text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Teaching Space
        </Button>
      </div>

      {isLoading && <Skeleton className="h-44 w-full rounded-2xl" />}

      {error && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 text-center space-y-1">
          <p className="text-sm font-medium text-destructive">
            Failed to load cohort details. Please try again.
          </p>
        </div>
      )}

      {!isLoading && cohort && (
        <>
          {/* Cohort Workspace Header Card */}
          <Card className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    {cohort.course.name}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ID: {cohort.id}
                  </Badge>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  Cohort Workspace — {cohort.course.name}
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Started {formatDate(cohort.startDate)}</span>
                  <span>· {cohort.studentCount} Students Enrolled</span>
                </p>
              </div>
            </div>
          </Card>

          {/* 6 Tabs Workspace Shell */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="rounded-xl bg-muted/60 p-1 flex-wrap">
              <TabsTrigger value="overview" className="rounded-lg text-xs">
                Overview
              </TabsTrigger>
              <TabsTrigger value="modules" className="rounded-lg text-xs">
                Modules ({cohort.modules.length})
              </TabsTrigger>
              <TabsTrigger value="assignments" className="rounded-lg text-xs">
                Assignments & Schedules
              </TabsTrigger>
              <TabsTrigger value="submissions" className="rounded-lg text-xs">
                Submissions & Grading
              </TabsTrigger>
              <TabsTrigger value="sessions" className="rounded-lg text-xs">
                Live Sessions & Attendance
              </TabsTrigger>
              <TabsTrigger value="roster" className="rounded-lg text-xs">
                Student Roster ({cohort.studentCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <CohortOverviewTab cohort={cohort} />
            </TabsContent>

            <TabsContent value="modules">
              <CohortModulesTab modules={cohort.modules} />
            </TabsContent>

            <TabsContent value="assignments">
              <CohortAssignmentsTab scheduleId={scheduleId} />
            </TabsContent>

            <TabsContent value="submissions">
              <CohortSubmissionsTab scheduleId={scheduleId} />
            </TabsContent>

            <TabsContent value="sessions">
              <CohortSessionsTab scheduleId={scheduleId} />
            </TabsContent>

            <TabsContent value="roster">
              <CohortRosterTab scheduleId={scheduleId} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
