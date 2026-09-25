import { use } from "react";
import { CohortAssignmentDetail } from "@/modules/teaching/components/CohortAssignmentDetail";

interface PageProps {
  params: Promise<{ scheduleId: string; assignmentId: string }>;
}

export default function CohortAssignmentDetailPage({ params }: PageProps) {
  const { scheduleId, assignmentId } = use(params);
  return (
    <CohortAssignmentDetail
      scheduleId={scheduleId}
      assignmentId={assignmentId}
    />
  );
}
