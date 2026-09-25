"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignmentConversation } from "@/modules/conversations/api/conversations.queries";
import { AssignmentThread } from "@/modules/messaging/components/AssignmentThread";

/**
 * The student's thread with the course staff about one assignment —
 * questions before submitting, follow-ups after grading. The thread is
 * found or created on first view.
 */
export function AssignmentStaffThread({
  assignmentId,
  courseId,
  moduleId,
  title,
}: {
  assignmentId: string;
  courseId?: string;
  moduleId?: string;
  title: string;
}) {
  const convo = useAssignmentConversation({ assignmentId, courseId, moduleId });
  // Without a course the API can't resolve the staff; nothing to show.
  if (!courseId) return null;

  return (
    <section aria-labelledby="staff-thread-heading" className="space-y-3 border-t border-border pt-6">
      <h2
        id="staff-thread-heading"
        className="flex items-center gap-2 font-display text-base font-semibold text-foreground"
      >
        <MessageSquare className="h-4 w-4 text-primary" aria-hidden />
        Questions for your tutor
      </h2>
      {convo.isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : convo.isError || !convo.data ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground" role="alert">
          Couldn&apos;t open the conversation for this assignment.
          <Button variant="outline" size="sm" onClick={() => convo.refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <AssignmentThread conversationId={convo.data} title={title} />
      )}
    </section>
  );
}
