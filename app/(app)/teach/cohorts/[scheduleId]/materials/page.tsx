import { Suspense, use } from "react";
import { MaterialForm } from "@/modules/teaching/components/MaterialForm";
import { AuthoringSkeleton } from "@/modules/teaching/components/authoring/authoring-kit";

interface PageProps {
  params: Promise<{ scheduleId: string }>;
}

/** "Add material" — `?module=<id>` pre-selects the module. */
export default function NewCohortMaterialPage({ params }: PageProps) {
  const { scheduleId } = use(params);
  return (
    <Suspense fallback={<AuthoringSkeleton />}>
      <MaterialForm scheduleId={scheduleId} />
    </Suspense>
  );
}
