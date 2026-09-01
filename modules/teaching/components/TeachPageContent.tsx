"use client";

import React, { useState } from "react";
import { GraduationCap, BookOpen } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeachingCohorts } from "../api/teaching.queries";
import { groupCohortsByCourse } from "../lib/group-cohorts";
import { CourseCard } from "./CourseCard";

export function TeachPageContent() {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");

  const { data: cohorts, isLoading, error } = useTeachingCohorts();

  const grouped = groupCohortsByCourse(cohorts || []);
  const activeGroups = grouped.active;
  const pastGroups = grouped.past;

  const currentGroups = activeTab === "active" ? activeGroups : pastGroups;

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            Instructor Teaching Space
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your assigned teaching cohorts, roster attendance, assignments, and submission grading.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "past")}>
          <TabsList className="rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="active" className="rounded-lg text-xs">
              Active Cohorts ({activeGroups.reduce((acc, g) => acc + g.cohorts.length, 0)})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg text-xs">
              Past Cohorts ({pastGroups.reduce((acc, g) => acc + g.cohorts.length, 0)})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-destructive">
            Failed to load teaching cohorts. Please try again.
          </p>
        </div>
      )}

      {/* Course Group List */}
      {!isLoading && !error && (
        <>
          {currentGroups.length > 0 ? (
            <div className="space-y-6">
              {currentGroups.map((group) => (
                <CourseCard key={group.courseId} group={group} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-12 text-center space-y-3">
              <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
              <h3 className="text-base font-semibold text-foreground">
                No {activeTab} teaching cohorts found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {activeTab === "active"
                  ? "You have no active teaching cohorts assigned at this time."
                  : "No completed or past cohorts found in your teaching archive."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
