import { Suspense, use } from "react";
import { AssignmentForm } from "@/modules/teaching/components/AssignmentForm";
import { AuthoringSkeleton } from "@/modules/teaching/components/authoring/authoring-kit";

interface PageProps {
  params: Promise<{ scheduleId: string }>;
}

/** New assignment for one cohort — `?module=<id>` pre-selects the module. */
export default function NewCohortAssignmentPage({ params }: PageProps) {
  const { scheduleId } = use(params);
  return (
    <Suspense fallback={<AuthoringSkeleton />}>
      <AssignmentForm scheduleId={scheduleId} />
    </Suspense>
  );
}
