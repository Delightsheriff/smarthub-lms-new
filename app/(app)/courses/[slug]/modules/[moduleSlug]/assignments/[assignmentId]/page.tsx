import { use } from "react";
import { AssignmentPageContent } from "@/modules/assignments/components/assignment-page-content";

interface CourseModuleAssignmentPageProps {
  params: Promise<{
    slug: string;
    moduleSlug: string;
    assignmentId: string;
  }>;
}

export default function CourseModuleAssignmentPage({ params }: CourseModuleAssignmentPageProps) {
  const { slug, moduleSlug, assignmentId } = use(params);
  return (
    <AssignmentPageContent
      assignmentId={assignmentId}
      courseSlug={slug}
      moduleSlug={moduleSlug}
    />
  );
}
