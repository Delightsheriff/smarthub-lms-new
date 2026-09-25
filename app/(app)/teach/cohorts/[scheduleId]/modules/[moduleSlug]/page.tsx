import { use } from "react";
import { CohortModulePageContent } from "@/modules/teaching/components/CohortModulePageContent";

interface PageProps {
  params: Promise<{ scheduleId: string; moduleSlug: string }>;
}

/** One module inside a cohort: status, content, and share controls. */
export default function CohortModulePage({ params }: PageProps) {
  const { scheduleId, moduleSlug } = use(params);
  return <CohortModulePageContent scheduleId={scheduleId} moduleSlug={moduleSlug} />;
}
