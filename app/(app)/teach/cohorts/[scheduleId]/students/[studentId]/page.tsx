import { use } from "react";
import { CohortStudentPageContent } from "@/modules/teaching/components/CohortStudentPageContent";

interface CohortStudentPageProps {
  params: Promise<{ scheduleId: string; studentId: string }>;
}

export default function CohortStudentPage({ params }: CohortStudentPageProps) {
  const { scheduleId, studentId } = use(params);
  return <CohortStudentPageContent scheduleId={scheduleId} studentId={studentId} />;
}
