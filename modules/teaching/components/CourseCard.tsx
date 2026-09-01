"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CohortCard } from "./CohortCard";
import type { CourseGroup } from "../lib/group-cohorts";

interface CourseCardProps {
  group: CourseGroup;
}

export function CourseCard({ group }: CourseCardProps) {
  return (
    <Card className="rounded-2xl border bg-card/60 p-6 space-y-4 shadow-xs">
      <CardHeader className="p-0 flex flex-row items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-bold text-foreground">
            {group.courseName}
          </CardTitle>
        </div>
        <Badge variant="outline" className="text-xs">
          {group.cohorts.length} Cohort{group.cohorts.length === 1 ? "" : "s"}
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {group.cohorts.map((cohort) => (
            <CohortCard key={cohort.id} cohort={cohort} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
