import { use } from "react";
import { AssignmentPageContent } from "@/modules/assignments/components/assignment-page-content";

interface AssignmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const { id } = use(params);
  return <AssignmentPageContent assignmentId={id} />;
}
