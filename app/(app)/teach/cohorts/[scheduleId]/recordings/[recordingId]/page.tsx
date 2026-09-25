import { use } from "react";
import { CohortRecordingDetail } from "@/modules/teaching/components/CohortRecordingDetail";

interface PageProps {
  params: Promise<{ scheduleId: string; recordingId: string }>;
}

export default function CohortRecordingPage({ params }: PageProps) {
  const { scheduleId, recordingId } = use(params);
  return <CohortRecordingDetail scheduleId={scheduleId} recordingId={recordingId} />;
}
