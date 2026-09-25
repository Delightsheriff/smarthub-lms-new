"use client";

import React, { useState } from "react";
import { uploadSizeError } from "@/lib/utils";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Link as LinkIcon, FileText, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSubmitAssignment,
  useResubmitAssignment,
  useUploadAssignmentFile,
} from "../api/assignments.queries";
import type { Assignment, Submission } from "../types";

/** Mirrors legacy: the file types tutors can open and grade. */
const ACCEPTED_MIME_TYPES =
  "application/pdf,image/png,image/jpeg,image/jpg,application/zip,application/x-ipynb+json,.ipynb,.py,.md,.txt,.docx,.pptx";

interface SubmissionFormProps {
  assignment: Assignment;
  existingSubmission?: Submission | null;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const submissionSchema = z.object({
  submissionType: z.enum(["file", "text", "url"]),
  content: z.string().trim().refine((value) => value.length === 0 || value.length >= 5, "Text must be at least 5 characters"),
  externalUrl: z.string().trim().refine((value) => value.length === 0 || /^https?:\/\/.+/i.test(value), "Enter a valid http(s) URL"),
  notes: z.string().max(2000, "Notes must be 2,000 characters or fewer"),
});

const SUBMISSION_FORMAT_OPTIONS = [
  { value: "file", label: "File Attachment (PDF, Zip, Doc)", icon: Upload },
  { value: "url", label: "External URL (GitHub, Figma, Notion)", icon: LinkIcon },
  { value: "text", label: "Inline Text Submission", icon: FileText },
] as const;

export function SubmissionForm({
  assignment,
  existingSubmission,
  trigger,
  onSuccess,
}: SubmissionFormProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const form = useForm<z.input<typeof submissionSchema>, unknown, z.output<typeof submissionSchema>>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { submissionType: existingSubmission?.submissionType || "file", content: existingSubmission?.content || "", externalUrl: existingSubmission?.externalUrl || "", notes: "" },
  });
  const submissionType = useWatch({ control: form.control, name: "submissionType" });

  const submitMutation = useSubmitAssignment();
  const resubmitMutation = useResubmitAssignment();
  const uploadMutation = useUploadAssignmentFile();

  const isPending =
    submitMutation.isPending ||
    resubmitMutation.isPending ||
    uploadMutation.isPending;

  const handleSubmit = async (values: z.output<typeof submissionSchema>) => {
    const submissionType = values.submissionType;

    let uploadedFileDetails:
      | {
          fileUrl: string;
          fileName: string;
          fileSize: number;
          fileMimeType: string;
        }
      | undefined;

    if (submissionType === "file") {
      if (selectedFile) {
        try {
          uploadedFileDetails = await uploadMutation.mutateAsync(selectedFile);
        } catch {
          toast.error("File upload failed. Please try again.");
          return;
        }
      } else if (!existingSubmission?.fileUrl) {
         form.setError("submissionType", { message: "Please select a file to submit." });
         return;
      }
    } else if (submissionType === "url" && !values.externalUrl) {
      form.setError("externalUrl", { message: "Enter an external URL." });
      return;
    } else if (submissionType === "text" && !values.content) {
      form.setError("content", { message: "Enter text content for your submission." });
      return;
    }

    const payload = {
      assignmentId: assignment.id,
      submissionType,
       content: submissionType === "text" ? values.content : undefined,
       externalUrl: submissionType === "url" ? values.externalUrl : undefined,
      fileUrl:
        uploadedFileDetails?.fileUrl ||
        (submissionType === "file" ? existingSubmission?.fileUrl : undefined),
      fileName:
        uploadedFileDetails?.fileName ||
        (submissionType === "file" ? existingSubmission?.fileName : undefined),
      fileSize:
        uploadedFileDetails?.fileSize ||
        (submissionType === "file" ? existingSubmission?.fileSize : undefined),
      fileMimeType:
        uploadedFileDetails?.fileMimeType ||
        (submissionType === "file"
          ? existingSubmission?.fileMimeType
          : undefined),
       notes: values.notes.trim() || undefined,
    };

    try {
      if (existingSubmission) {
        await resubmitMutation.mutateAsync({
          submissionId: existingSubmission.id,
          payload,
        });
        toast.success("Assignment resubmitted successfully!");
      } else {
        await submitMutation.mutateAsync(payload);
        toast.success("Assignment submitted successfully!");
      }
      form.reset({ submissionType: "file", content: "", externalUrl: "", notes: "" });
      setSelectedFile(null);
      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to submit assignment. Please try again.");
    }
  };

  const defaultTrigger = (
    <Button size="lg" className="rounded-xl shadow-sm">
      <Send className="mr-2 h-4 w-4" />
      {existingSubmission ? "Resubmit Assignment" : "Submit Assignment"}
    </Button>
  );

  const triggerElement = (trigger || defaultTrigger) as React.ReactElement;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={triggerElement} />
      <DialogContent className="sm:max-w-[540px] rounded-2xl border-border bg-card shadow-lg">
        <Form {...form}><form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-semibold">
              {existingSubmission ? "Resubmit Work" : "Submit Assignment"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {assignment.title} · Max {assignment.totalPoints} points
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Submission Type Selector */}
             <FormField control={form.control} name="submissionType" render={({ field }) => <FormItem className="space-y-2">
               <FormLabel>Submission Format</FormLabel>
               <Select
                 value={field.value}
                 onValueChange={(v) => field.onChange(v)}
                 disabled={form.formState.isSubmitting}
               >
                  <FormControl><SelectTrigger id="submissionType" className="rounded-xl">
                    <SelectValue placeholder="Select submission type">
                      {(v: string) => {
                        const opt = SUBMISSION_FORMAT_OPTIONS.find((o) => o.value === v);
                        if (!opt) return "Select submission type";
                        const Icon = opt.icon;
                        return (
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{opt.label}</span>
                          </span>
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger></FormControl>
                 <SelectContent className="rounded-xl">
                   {SUBMISSION_FORMAT_OPTIONS.map(({ value, label, icon: Icon }) => (
                     <SelectItem key={value} value={value}>
                       <div className="flex items-center gap-2">
                         <Icon className="h-4 w-4" />
                         <span>{label}</span>
                       </div>
                     </SelectItem>
                   ))}
                 </SelectContent>
                </Select><FormMessage />
             </FormItem>} />

            {/* File Upload Input */}
             {submissionType === "file" && (
              <div className="space-y-2">
                <Label htmlFor="fileInput">Choose File</Label>
                <Input
                  id="fileInput"
                  type="file"
                   className="rounded-xl cursor-pointer"
                   disabled={form.formState.isSubmitting}
                  accept={ACCEPTED_MIME_TYPES}
                  aria-invalid={!!fileError || undefined}
                  aria-describedby="fileInput-hint"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    // Catch an oversize file before the upload round-trip.
                    const tooBig = file ? uploadSizeError(file) : null;
                    setFileError(tooBig);
                    setSelectedFile(tooBig ? null : file);
                    if (tooBig) e.target.value = "";
                  }}
                />
                <p
                  id="fileInput-hint"
                  className={fileError ? "text-xs text-destructive" : "text-xs text-muted-foreground"}
                  role={fileError ? "alert" : undefined}
                >
                  {fileError ??
                    "PDF, image, zip, notebook, .py, .md, .txt, .docx or .pptx. Documents up to 10 MB, images up to 25 MB."}
                </p>
                {existingSubmission?.fileName && !selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    Current file: <span className="font-mono">{existingSubmission.fileName}</span>
                  </p>
                )}
              </div>
            )}

            {/* URL Input */}
             {submissionType === "url" && (
               <FormField control={form.control} name="externalUrl" render={({ field }) => <FormItem className="space-y-2"><FormLabel>External Repository / Link</FormLabel><FormControl><Input type="url" placeholder="https://github.com/username/project" className="rounded-xl" disabled={form.formState.isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>} />
             )}

            {/* Text Input */}
             {submissionType === "text" && (
               <FormField control={form.control} name="content" render={({ field }) => <FormItem className="space-y-2"><FormLabel>Submission Answer / Code</FormLabel><FormControl><Textarea rows={6} placeholder="Paste or write your solution here..." className="rounded-xl font-mono text-xs" disabled={form.formState.isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>} />
             )}

            {/* Notes field */}
             <FormField control={form.control} name="notes" render={({ field }) => <FormItem className="space-y-2"><FormLabel>Notes for Instructor (Optional)</FormLabel><FormControl><Textarea rows={2} placeholder="Any comments, questions, or instructions for grading..." className="rounded-xl" disabled={form.formState.isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>} />
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setOpen(false)}
               disabled={isPending || form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl" disabled={isPending || form.formState.isSubmitting}>
              {isPending || form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Confirm & Submit"
              )}
            </Button>
          </DialogFooter>
        </form></Form>
      </DialogContent>
    </Dialog>
  );
}
