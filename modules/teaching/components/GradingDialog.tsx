"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Award, ExternalLink, Download, ChevronDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { RichText } from "@/components/ui/rich-text";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDateTime, cn } from "@/lib/utils";
import { MaterialPreviewDialog } from "@/modules/learning/components/material-preview-dialog";
import { useTeachingAssignment, useGradeSubmission } from "../api/teaching.queries";
import type { CohortSubmissionRow } from "../types";

export interface GradingDialogProps {
  submission: CohortSubmissionRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGradeSubmit?: (score: number, feedback?: string) => Promise<void>;
  scheduleId?: string;
  onSaveAndNext?: (score: number, feedback?: string) => Promise<void>;
}

export function GradingDialog(props: GradingDialogProps) {
  if (!props.submission) return null;

  return (
    <GradingForm
      key={props.submission.id}
      {...props}
      submission={props.submission}
    />
  );
}

function GradingForm({
  submission,
  open,
  onOpenChange,
  onGradeSubmit,
  scheduleId,
  onSaveAndNext,
}: GradingDialogProps & { submission: CohortSubmissionRow }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch assignment description/instructions ONLY while the dialog is open
  const assignment = useTeachingAssignment(submission.assignment.id, open);
  const gradeMutation = useGradeSubmission(scheduleId || "");

  const doGrade = onGradeSubmit ?? (async (score: number, feedback?: string) => {
    await gradeMutation.mutateAsync({
      submissionId: submission.id,
      score,
      feedback,
    });
  });

  const totalPoints = submission.assignment.totalPoints || 100;
  const schema = z.object({
    score: z
      .number({ message: "Score is required" })
      .min(0, "Score cannot be negative")
      .max(totalPoints, `Score cannot exceed ${totalPoints}`),
    feedback: z
      .string()
      .max(2000, "Feedback must be 2,000 characters or fewer")
      .optional(),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      score:
        submission.score !== undefined && submission.score !== null
          ? submission.score
          : (undefined as unknown as number),
      feedback: submission.generalFeedback || "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setErrorMessage(null);
      await doGrade(values.score, values.feedback?.trim() || undefined);
      form.reset();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ||
            "Failed to record grade. Please try again.";
      setErrorMessage(message);
    }
  };

  const handleSaveAndNext = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    const values = form.getValues();
    try {
      setErrorMessage(null);
      if (onSaveAndNext) {
        await onSaveAndNext(values.score, values.feedback?.trim() || undefined);
      } else {
        await doGrade(values.score, values.feedback?.trim() || undefined);
        form.reset();
        onOpenChange(false);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ||
            "Failed to record grade. Please try again.";
      setErrorMessage(message);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[580px] rounded-2xl border-border bg-card max-h-[90vh] overflow-y-auto">
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
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              Grade Submission — {submission.student.name}
            </DialogTitle>
            {submission.submittedAt && (
              <DialogDescription className="text-xs text-muted-foreground">
                Submitted on {formatDateTime(submission.submittedAt)}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Collapsed "The question" section */}
            {(assignment.data?.description || assignment.data?.instructions || assignment.data?.assignmentLink) && (
              <div className="rounded-xl border border-border overflow-hidden bg-muted/10">
                <button
                  type="button"
                  onClick={() => setBriefOpen((v) => !v)}
                  aria-expanded={briefOpen}
                  className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-muted/30"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    The question
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      briefOpen && "rotate-180",
                    )}
                  />
                </button>
                {briefOpen && (
                  <div className="space-y-3 border-t border-border px-3.5 py-3 text-xs">
                    {assignment.data?.description && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Brief
                        </p>
                        <RichText html={assignment.data.description} />
                      </div>
                    )}
                    {assignment.data?.instructions && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Instructions
                        </p>
                        <RichText html={assignment.data.instructions} />
                      </div>
                    )}
                    {assignment.data?.assignmentLink && (
                      <a
                        href={assignment.data.assignmentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Attached link
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submission preview box */}
            <div className="rounded-xl border bg-muted/20 p-4 space-y-2 text-xs">
              <div className="font-semibold text-foreground flex items-center justify-between">
                <span>Submission Work</span>
                <Badge variant="secondary" className="text-[10px]">
                  {submission.submissionType || "file"}
                </Badge>
              </div>

              {submission.submissionType === "url" && submission.externalUrl && (
                <div className="pt-1 space-y-1.5">
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
                    className="w-full justify-start rounded-xl"
                  >
                    <ExternalLink className="mr-2 h-4 w-4 shrink-0 text-primary" />
                    Open submission link
                  </Button>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    {submission.externalUrl}
                  </p>
                </div>
              )}

              {submission.submissionType === "file" && submission.fileUrl && (
                <div className="pt-1 flex items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate font-mono text-muted-foreground">
                    {submission.fileName || "submission-file.zip"}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewOpen(true)}
                      className="rounded-xl h-7 text-xs"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview
                    </Button>
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
                      className="rounded-xl h-7 text-xs"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                </div>
              )}

              {submission.content && (
                <p className="text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed bg-background p-3 rounded-lg border">
                  {submission.content}
                </p>
              )}
            </div>

            {/* Grading Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {errorMessage && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                    {errorMessage}
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">
                        Score (Out of {totalPoints})
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={totalPoints}
                          placeholder={`0 - ${totalPoints}`}
                          className="rounded-xl"
                          disabled={form.formState.isSubmitting}
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? undefined : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">
                        Instructor Feedback &amp; Comments
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide constructive feedback for the student..."
                          rows={3}
                          className="rounded-xl text-xs"
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="rounded-xl text-xs"
                    disabled={form.formState.isSubmitting}
                  >
                    Cancel
                  </Button>
                  {onSaveAndNext && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSaveAndNext}
                      className="rounded-xl text-xs font-medium"
                      disabled={form.formState.isSubmitting}
                    >
                      Save &amp; next ungraded
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="rounded-xl text-xs font-semibold"
                  >
                    <Award className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting ? "Saving..." : "Record Grade"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {submission.fileUrl && (
        <MaterialPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          title={submission.fileName || submission.assignment.title}
          url={submission.fileUrl}
        />
      )}
    </>
  );
}
