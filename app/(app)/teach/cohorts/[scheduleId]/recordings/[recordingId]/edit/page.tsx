import { Suspense, use } from "react";
import { RecordingForm } from "@/modules/teaching/components/RecordingForm";
import { AuthoringSkeleton } from "@/modules/teaching/components/authoring/authoring-kit";

interface PageProps {
  params: Promise<{ scheduleId: string; recordingId: string }>;
}

export default function EditCohortRecordingPage({ params }: PageProps) {
  const { scheduleId, recordingId } = use(params);
  return (
    <Suspense fallback={<AuthoringSkeleton />}>
      <RecordingForm scheduleId={scheduleId} recordingId={recordingId} />
    </Suspense>
  );
}
