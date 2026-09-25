"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { formatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useTeachingCohortDetail } from "../api/teaching.queries";
import { CohortOverviewTab } from "./CohortOverviewTab";
import { CohortModulesTab } from "./CohortModulesTab";
import { CohortSwitcher } from "./CohortSwitcher";
import { CohortAssignmentsTab } from "./CohortAssignmentsTab";
import { CohortSubmissionsTab } from "./CohortSubmissionsTab";
import { CohortSessionsTab } from "./CohortSessionsTab";
import { CohortRosterTab } from "./CohortRosterTab";

const VALID_TABS = [
  "overview",
  "modules",
  "assignments",
  "submissions",
  "sessions",
  "roster",
] as const;
type TabValue = (typeof VALID_TABS)[number];

function toValidTab(raw: string | null): TabValue {
  if (raw && (VALID_TABS as readonly string[]).includes(raw)) {
    return raw as TabValue;
  }
  return "overview";
}

interface CohortDetailPageContentProps {
  scheduleId: string;
}

export function CohortDetailPageContent({ scheduleId }: CohortDetailPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = toValidTab(searchParams.get("tab"));

  const { data: cohort, isLoading, isFetching, error, refetch } = useTeachingCohortDetail(scheduleId);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("tab", tab);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      refetch(),
      queryClient.invalidateQueries({ queryKey: ["teaching", "cohort", scheduleId] }),
      queryClient.invalidateQueries({ queryKey: ["calendar"] }),
    ]);
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button
          nativeButton={false} render={<Link href="/teach" />}
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
          <PageHeader
            variant="editorial"
            divider
            dateline={`${formatDate(cohort.startDate)} · Cohort Workspace`}
            title={cohort.course.name}
            description={
              <>
                Instructor cohort workspace.{" "}
                <strong className="text-foreground">{cohort.studentCount}</strong> students enrolled
                {" · "}
                <strong className="text-foreground">{cohort.modules.length}</strong> syllabus modules.
              </>
            }
            actions={
              <>
                <CohortSwitcher scheduleId={scheduleId} courseId={cohort.course.id} />
                <RefreshButton
                  loading={isFetching || isRefreshing}
                  onClick={handleRefresh}
                />
              </>
            }
          />

          {/* 6 Tabs Workspace Shell */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <div className="overflow-x-auto pb-1 max-w-full -mx-1 px-1">
              <TabsList className="rounded-xl bg-muted/60 p-1 w-max">
                <TabsTrigger value="overview" className="rounded-lg text-xs">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="modules" className="rounded-lg text-xs">
                  Modules ({cohort.modules.length})
                </TabsTrigger>
                <TabsTrigger value="assignments" className="rounded-lg text-xs">
                  Assignments &amp; Schedules
                </TabsTrigger>
                <TabsTrigger value="submissions" className="rounded-lg text-xs">
                  Submissions &amp; Grading
                </TabsTrigger>
                <TabsTrigger value="sessions" className="rounded-lg text-xs">
                  Live Sessions &amp; Attendance
                </TabsTrigger>
                <TabsTrigger value="roster" className="rounded-lg text-xs">
                  Student Roster ({cohort.studentCount})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview">
              <CohortOverviewTab cohort={cohort} />
            </TabsContent>

            <TabsContent value="modules">
              <CohortModulesTab scheduleId={scheduleId} modules={cohort.modules} />
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
