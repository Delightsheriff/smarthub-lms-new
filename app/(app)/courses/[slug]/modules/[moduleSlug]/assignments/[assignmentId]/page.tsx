import { use } from "react";
import AssignmentDetailPage from "@/app/(app)/assignments/[id]/page";

interface CourseModuleAssignmentPageProps {
  params: Promise<{
    slug: string;
    moduleSlug: string;
    assignmentId: string;
  }>;
}

export default function CourseModuleAssignmentPage({ params }: CourseModuleAssignmentPageProps) {
  const { assignmentId } = use(params);
  return <AssignmentDetailPage params={Promise.resolve({ id: assignmentId })} />;
}
