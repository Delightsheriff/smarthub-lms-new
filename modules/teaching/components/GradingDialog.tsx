"use client";

import React, { useState } from "react";
import { Award, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import type { CohortSubmissionRow } from "../types";

interface GradingDialogProps {
  submission: CohortSubmissionRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGradeSubmit: (score: number, feedback?: string) => Promise<void>;
}

export function GradingDialog({
  submission,
  open,
  onOpenChange,
  onGradeSubmit,
}: GradingDialogProps) {
  const [score, setScore] = useState<number>(submission?.score ?? 100);
  const [feedback, setFeedback] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  if (!submission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onGradeSubmit(score, feedback);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {submission.assignment.title}
            </Badge>
            {submission.isLate && (
              <Badge variant="destructive" className="text-[10px]">
                Late Submission
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Grade Submission — {submission.student.name}
          </DialogTitle>
          {submission.submittedAt && (
            <DialogDescription className="text-xs text-muted-foreground">
              Submitted on {formatDateTime(submission.submittedAt)}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Content Preview Box */}
        <div className="space-y-4 py-2">
          <div className="rounded-xl border bg-muted/20 p-4 space-y-2 text-xs">
            <div className="font-semibold text-foreground flex items-center justify-between">
              <span>Submission Work</span>
              <Badge variant="secondary" className="text-[10px]">
                {submission.submissionType || "file"}
              </Badge>
            </div>

            {submission.submissionType === "url" && submission.externalUrl && (
              <div className="pt-1">
                <Button
                  render={
                    <a
                      href={submission.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  <ExternalLink className="mr-2 h-4 w-4 text-primary" /> Open Link: {submission.externalUrl}
                </Button>
              </div>
            )}

            {submission.submissionType === "file" && submission.fileUrl && (
              <div className="pt-1 flex items-center justify-between">
                <span className="font-mono text-muted-foreground">{submission.fileName || "submission-file.zip"}</span>
                <Button
                  render={
                    <a
                      href={submission.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                    />
                  }
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download File
                </Button>
              </div>
            )}

            {submission.content && (
              <p className="text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed bg-background p-3 rounded-lg border">
                {submission.content}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Score (Out of {submission.assignment.totalPoints || 100})
              </label>
              <Input
                type="number"
                min={0}
                max={submission.assignment.totalPoints || 100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Instructor Feedback & Comments
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide constructive feedback for the student..."
                rows={3}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="pt-2 border-t flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-xl">
                <Award className="mr-2 h-4 w-4" />
                {submitting ? "Saving..." : "Record Grade"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
