"use client";

import React, { useState } from "react";
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

interface SubmissionFormProps {
  assignment: Assignment;
  existingSubmission?: Submission | null;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function SubmissionForm({
  assignment,
  existingSubmission,
  trigger,
  onSuccess,
}: SubmissionFormProps) {
  const [open, setOpen] = useState(false);
  const [submissionType, setSubmissionType] = useState<"file" | "text" | "url">(
    existingSubmission?.submissionType || "file",
  );
  const [content, setContent] = useState(existingSubmission?.content || "");
  const [externalUrl, setExternalUrl] = useState(
    existingSubmission?.externalUrl || "",
  );
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const submitMutation = useSubmitAssignment();
  const resubmitMutation = useResubmitAssignment();
  const uploadMutation = useUploadAssignmentFile();

  const isPending =
    submitMutation.isPending ||
    resubmitMutation.isPending ||
    uploadMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        toast.error("Please select a file to submit.");
        return;
      }
    } else if (submissionType === "url" && !externalUrl) {
      toast.error("Please enter a valid external URL.");
      return;
    } else if (submissionType === "text" && !content) {
      toast.error("Please enter text content for your submission.");
      return;
    }

    const payload = {
      assignmentId: assignment.id,
      submissionType,
      content: submissionType === "text" ? content : undefined,
      externalUrl: submissionType === "url" ? externalUrl : undefined,
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
      notes: notes || undefined,
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
      <DialogContent className="sm:max-w-[540px] rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {existingSubmission ? "Resubmit Work" : "Submit Assignment"}
            </DialogTitle>
            <DialogDescription>
              {assignment.title} · Max {assignment.totalPoints} points
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Submission Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="submissionType">Submission Format</Label>
              <Select
                value={submissionType}
                onValueChange={(v) => setSubmissionType(v as "file" | "text" | "url")}
              >
                <SelectTrigger id="submissionType" className="rounded-xl">
                  <SelectValue placeholder="Select submission type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="file">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" /> File Attachment (PDF, Zip, Doc)
                    </div>
                  </SelectItem>
                  <SelectItem value="url">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" /> External URL (GitHub, Figma, Notion)
                    </div>
                  </SelectItem>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Inline Text Submission
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload Input */}
            {submissionType === "file" && (
              <div className="space-y-2">
                <Label htmlFor="fileInput">Choose File</Label>
                <Input
                  id="fileInput"
                  type="file"
                  className="rounded-xl cursor-pointer"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {existingSubmission?.fileName && !selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    Current file: <span className="font-mono">{existingSubmission.fileName}</span>
                  </p>
                )}
              </div>
            )}

            {/* URL Input */}
            {submissionType === "url" && (
              <div className="space-y-2">
                <Label htmlFor="externalUrl">External Repository / Link</Label>
                <Input
                  id="externalUrl"
                  type="url"
                  placeholder="https://github.com/username/project"
                  className="rounded-xl"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
              </div>
            )}

            {/* Text Input */}
            {submissionType === "text" && (
              <div className="space-y-2">
                <Label htmlFor="textContent">Submission Answer / Code</Label>
                <Textarea
                  id="textContent"
                  rows={6}
                  placeholder="Paste or write your solution here..."
                  className="rounded-xl font-mono text-xs"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            )}

            {/* Notes field */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes for Instructor (Optional)</Label>
              <Textarea
                id="notes"
                rows={2}
                placeholder="Any comments, questions, or instructions for grading..."
                className="rounded-xl"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Confirm & Submit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
