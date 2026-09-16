"use client";

import React from "react";
import Link from "next/link";
import { Users, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { isCohortEnded } from "../lib/group-cohorts";
import type { TeachingCohort } from "../types";

interface CohortCardProps {
  cohort: TeachingCohort;
}

export function CohortCard({ cohort }: CohortCardProps) {
  const isEnded = isCohortEnded(cohort.endDate);

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant={isEnded ? "outline" : "success"}
            className={isEnded ? "text-muted-foreground" : undefined}
          >
            {isEnded ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </span>
            ) : (
              "Active Cohort"
            )}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">{cohort.studentCount}</span>
            <span>Students</span>
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="font-display font-semibold text-base text-foreground">
            {cohort.course.name}
          </h4>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Started {formatDate(cohort.startDate)}</span>
            {cohort.endDate && <span>· Ends {formatDate(cohort.endDate)}</span>}
          </p>
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground">
            <span>Course Progress</span>
            <span className="tabular-nums">{cohort.progress}%</span>
          </div>
          <Progress value={cohort.progress} className="h-2 rounded-full" />
        </div>
      </CardContent>

      <CardFooter className="px-5 pb-5 pt-0">
        <Button
          render={<Link href={`/teach/cohorts/${cohort.id}`} />}
          className="w-full rounded-xl"
        >
          Open Workspace <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
