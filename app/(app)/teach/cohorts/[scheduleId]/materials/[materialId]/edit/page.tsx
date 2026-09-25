import { Suspense, use } from "react";
import { MaterialForm } from "@/modules/teaching/components/MaterialForm";
import { AuthoringSkeleton } from "@/modules/teaching/components/authoring/authoring-kit";

interface PageProps {
  params: Promise<{ scheduleId: string; materialId: string }>;
}

export default function EditCohortMaterialPage({ params }: PageProps) {
  const { scheduleId, materialId } = use(params);
  return (
    <Suspense fallback={<AuthoringSkeleton />}>
      <MaterialForm scheduleId={scheduleId} materialId={materialId} />
    </Suspense>
  );
}
