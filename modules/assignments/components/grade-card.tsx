"use client";

import React from "react";
import { Award, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import type { Submission } from "../types";

interface GradeCardProps {
  submission: Submission;
}

export function GradeCard({ submission }: GradeCardProps) {
  const grade = submission.grade;
  const feedback = submission.feedback;

  if (!grade) return null;

  return (
    <Card className="rounded-2xl border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <CardTitle className="text-base font-semibold text-emerald-950 dark:text-emerald-100">
            Assessment & Grade
          </CardTitle>
        </div>
        {submission.gradedAt && (
          <span className="text-xs text-muted-foreground">
            Graded on {formatDateTime(submission.gradedAt)}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall score summary */}
        <div className="flex items-center justify-between rounded-xl bg-background border p-4">
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {grade.score}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {grade.totalPoints} pts
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Final Score Calculation
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-600 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-sm font-semibold px-3 py-1"
            >
              {grade.percentage}%
            </Badge>
            {grade.letterGrade && (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-3 py-1">
                {grade.letterGrade}
              </Badge>
            )}
          </div>
        </div>

        {/* General Feedback */}
        {feedback?.general && (
          <div className="rounded-xl border bg-background p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <MessageSquare className="h-3.5 w-3.5 text-primary" /> Instructor Feedback
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feedback.general}
            </p>
          </div>
        )}

        {/* Rubric scores */}
        {grade.rubricScores && grade.rubricScores.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rubric Breakdown
            </h4>
            <div className="divide-y rounded-xl border bg-background">
              {grade.rubricScores.map((rubric, idx) => (
                <div key={idx} className="p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span>{rubric.criterion}</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {rubric.score} / {rubric.totalPoints} pts
                    </span>
                  </div>
                  {rubric.comment && (
                    <p className="text-xs text-muted-foreground">
                      {rubric.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
