import { use } from "react";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ scheduleId: string; assignmentId: string }>;
}

export default function CohortAssignmentDetailPage({ params }: PageProps) {
  const { scheduleId } = use(params);
  redirect(`/teach/cohorts/${scheduleId}?tab=assignments`);
}
