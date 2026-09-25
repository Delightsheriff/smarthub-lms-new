"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Award, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  if (!submission) return null;

  return <GradingForm key={submission.id} submission={submission} open={open} onOpenChange={onOpenChange} onGradeSubmit={onGradeSubmit} />;
}

function GradingForm({
  submission,
  open,
  onOpenChange,
  onGradeSubmit,
}: GradingDialogProps & { submission: CohortSubmissionRow }) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
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
      feedback: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setErrorMessage(null);
      await onGradeSubmit(values.score, values.feedback?.trim() || undefined);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] rounded-2xl border-border bg-card">
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
                <span className="min-w-0 flex-1 truncate font-mono text-muted-foreground">{submission.fileName || "submission-file.zip"}</span>
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
                  className="shrink-0 rounded-xl"
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
                    <FormLabel className="text-xs font-semibold">Score (Out of {totalPoints})</FormLabel>
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
              <FormField control={form.control} name="feedback" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Instructor Feedback & Comments</FormLabel>
                  <FormControl><Textarea placeholder="Provide constructive feedback for the student..." rows={3} className="rounded-xl text-xs" disabled={form.formState.isSubmitting} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="pt-2 border-t flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl"
                  disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-xl">
                <Award className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? "Saving..." : "Record Grade"}
              </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
