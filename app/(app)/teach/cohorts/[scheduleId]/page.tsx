import { use } from "react";
import { CohortDetailPageContent } from "@/modules/teaching/components/CohortDetailPageContent";

interface CohortDetailPageProps {
  params: Promise<{ scheduleId: string }>;
}

export default function CohortDetailPage({ params }: CohortDetailPageProps) {
  const { scheduleId } = use(params);
  return <CohortDetailPageContent scheduleId={scheduleId} />;
}
