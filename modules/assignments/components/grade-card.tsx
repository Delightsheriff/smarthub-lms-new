"use client";

import React from "react";
import { Mic, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Submission } from "../types";

interface GradeCardProps {
  submission: Submission;
}

/**
 * Renders the grader's verdict — written feedback plus optional audio/
 * video, and nothing else. Score / percentage / letter grade / rubric
 * are deliberately not surfaced here: points-based grading is hidden
 * from students by design (matches legacy's grade-card.tsx, which has
 * that whole block commented out with the same note). If that decision
 * changes, `submission.grade` already carries the full shape needed to
 * bring it back — see the type in ../types.
 */
export function GradeCard({ submission }: GradeCardProps) {
  const feedback = submission.feedback;
  if (!feedback) return null;

  return (
    <Card className="p-5 md:p-6 space-y-5 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
      {feedback.general && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Instructor feedback</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
            {feedback.general}
          </p>
        </div>
      )}

      {feedback.audioFeedbackUrl && (
        <div className="space-y-2">
          <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold">
            <Mic className="h-3.5 w-3.5" />
            Audio feedback
          </h3>
          <audio controls src={feedback.audioFeedbackUrl} className="w-full" />
        </div>
      )}

      {feedback.videoFeedbackUrl && (
        <div className="space-y-2">
          <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold">
            <Video className="h-3.5 w-3.5" />
            Video feedback
          </h3>
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            <video src={feedback.videoFeedbackUrl} controls className="h-full w-full" />
          </div>
        </div>
      )}
    </Card>
  );
}
