"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  ClipboardList,
  Clock,
  FileText,
  PlayCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatTile } from "@/components/ui/stat-tile";
import type { TeachingCohortDetail } from "../types";

interface CohortOverviewTabProps {
  cohort: TeachingCohortDetail;
}

const CREATE_ACTIONS: { path: string; icon: LucideIcon; label: string; hint: string }[] = [
  { path: "assignments/new", icon: ClipboardList, label: "New assignment", hint: "Brief, points, due date." },
  { path: "recordings", icon: PlayCircle, label: "Add recording", hint: "Class video or walkthrough." },
  { path: "materials", icon: FileText, label: "Add material", hint: "Slides, PDF, dataset or guide." },
];

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

      {/* The three things an instructor makes for a cohort. */}
      <section aria-labelledby="create-heading" className="space-y-3">
        <h2
          id="create-heading"
          className="font-mono text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase"
        >
          Add to this cohort
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {CREATE_ACTIONS.map(({ path, icon: Icon, label, hint }) => (
            <Link
              key={path}
              href={`/teach/cohorts/${cohort.id}/${path}`}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground group-hover:text-primary">
                  {label}
                </span>
                <span className="block text-xs text-muted-foreground">{hint}</span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </section>

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
