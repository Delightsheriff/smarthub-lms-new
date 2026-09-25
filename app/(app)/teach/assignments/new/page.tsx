import { CreateAssignmentMultiCohort } from "@/modules/teaching/components/CreateAssignmentMultiCohort";

/**
 * Tasks-page entry for creating one assignment across several cohorts.
 * Lives under /teach because /assignments is the student aggregate.
 */
export default function NewMultiCohortAssignmentPage() {
  return <CreateAssignmentMultiCohort />;
}
