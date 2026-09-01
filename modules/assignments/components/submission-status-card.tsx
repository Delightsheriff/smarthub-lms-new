"use client";

import React from "react";
import {
  FileCheck,
  FileText,
  Globe,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { Submission } from "../types";

interface SubmissionStatusCardProps {
  submission: Submission;
  _onResubmitClick?: () => void;
}

export function SubmissionStatusCard({
  submission,
  _onResubmitClick,
}: SubmissionStatusCardProps) {
  const getStatusBadge = () => {
    switch (submission.status) {
      case "graded":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Graded
          </Badge>
        );
      case "resubmitted":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            <Clock className="mr-1 h-3.5 w-3.5" /> Resubmitted
          </Badge>
        );
      case "returned":
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3.5 w-3.5" /> Returned for Revision
          </Badge>
        );
      case "submitted":
      default:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <FileCheck className="mr-1 h-3.5 w-3.5" /> Submitted
          </Badge>
        );
    }
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">Your Submission</CardTitle>
          <Badge variant="outline" className="text-xs font-mono">
            v{submission.version}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {submission.isLateSubmission && (
            <Badge variant="destructive" className="text-xs">
              Late
            </Badge>
          )}
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="text-xs text-muted-foreground">
          Submitted on {formatDateTime(submission.submittedAt)}
        </div>

        {submission.submissionType === "file" && submission.fileUrl && (
          <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
            <Paperclip className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline truncate block"
              >
                {submission.fileName || "Download Attached File"}
              </a>
              {submission.fileSize && (
                <span className="text-xs text-muted-foreground">
                  {(submission.fileSize / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
          </div>
        )}

        {submission.submissionType === "url" && submission.externalUrl && (
          <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
            <Globe className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <a
                href={submission.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline truncate block"
              >
                {submission.externalUrl}
              </a>
            </div>
          </div>
        )}

        {submission.submissionType === "text" && submission.content && (
          <div className="rounded-xl border bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
              <FileText className="h-3.5 w-3.5" /> Text Submission Content
            </div>
            <p className="whitespace-pre-wrap text-foreground font-mono text-xs leading-relaxed">
              {submission.content}
            </p>
          </div>
        )}

        {submission.notes && (
          <div className="rounded-xl bg-muted/20 p-3 border text-xs space-y-1">
            <span className="font-semibold text-muted-foreground">Submission Notes:</span>
            <p className="text-foreground">{submission.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
