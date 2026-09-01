import { use } from "react";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ scheduleId: string }>;
}

export default function CohortNewAssignmentPage({ params }: PageProps) {
  const { scheduleId } = use(params);
  redirect(`/teach/cohorts/${scheduleId}?tab=assignments`);
}
