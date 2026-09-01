import { use } from "react";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ scheduleId: string; materialId: string }>;
}

export default function CohortEditMaterialPage({ params }: PageProps) {
  const { scheduleId } = use(params);
  redirect(`/teach/cohorts/${scheduleId}?tab=modules`);
}
