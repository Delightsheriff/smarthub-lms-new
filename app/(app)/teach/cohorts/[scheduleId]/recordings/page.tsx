import { Suspense, use } from "react";
import { RecordingForm } from "@/modules/teaching/components/RecordingForm";
import { AuthoringSkeleton } from "@/modules/teaching/components/authoring/authoring-kit";

interface PageProps {
  params: Promise<{ scheduleId: string }>;
}

/** "Add recording" — `?module=<id>` pre-selects the module. */
export default function NewCohortRecordingPage({ params }: PageProps) {
  const { scheduleId } = use(params);
  return (
    <Suspense fallback={<AuthoringSkeleton />}>
      <RecordingForm scheduleId={scheduleId} />
    </Suspense>
  );
}
