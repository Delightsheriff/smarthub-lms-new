import { Suspense, use } from "react";
import { AssignmentForm } from "@/modules/teaching/components/AssignmentForm";
import { AuthoringSkeleton } from "@/modules/teaching/components/authoring/authoring-kit";

interface PageProps {
  params: Promise<{ scheduleId: string; assignmentId: string }>;
}

export default function EditCohortAssignmentPage({ params }: PageProps) {
  const { scheduleId, assignmentId } = use(params);
  return (
    <Suspense fallback={<AuthoringSkeleton />}>
      <AssignmentForm scheduleId={scheduleId} assignmentId={assignmentId} />
    </Suspense>
  );
}
