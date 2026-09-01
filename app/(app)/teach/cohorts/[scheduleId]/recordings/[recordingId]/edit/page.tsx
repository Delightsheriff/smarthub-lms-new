import { use } from "react";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ scheduleId: string; recordingId: string }>;
}

export default function CohortEditRecordingPage({ params }: PageProps) {
  const { scheduleId } = use(params);
  redirect(`/teach/cohorts/${scheduleId}?tab=modules`);
}
