"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pluralize } from "@/lib/utils";
import { CohortCard } from "./CohortCard";
import type { CourseGroup } from "../lib/group-cohorts";

interface CourseCardProps {
  group: CourseGroup;
}

export function CourseCard({ group }: CourseCardProps) {
  return (
    <Card className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-4 shadow-sm">
      <CardHeader className="p-0 flex flex-row items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <CardTitle className="font-display text-lg font-semibold text-foreground">
            {group.courseName}
          </CardTitle>
        </div>
        <Badge variant="outline" className="text-xs">
          {pluralize(group.cohorts.length, "Cohort")}
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {group.cohorts.map((cohort) => (
            <CohortCard key={cohort.id} cohort={cohort} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
