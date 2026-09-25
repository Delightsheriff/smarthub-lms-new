import { use } from "react";
import { CohortMaterialDetail } from "@/modules/teaching/components/CohortMaterialDetail";

interface PageProps {
  params: Promise<{ scheduleId: string; materialId: string }>;
}

export default function CohortMaterialPage({ params }: PageProps) {
  const { scheduleId, materialId } = use(params);
  return <CohortMaterialDetail scheduleId={scheduleId} materialId={materialId} />;
}
