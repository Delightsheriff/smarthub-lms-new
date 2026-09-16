import { PageHeader } from "@/components/layout/page-header";
import { JobsPageContent } from "@/modules/jobs/components/JobsPageContent";

export const metadata = {
  title: "Jobs",
};

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        eyebrow="Career"
        title="Jobs"
        description="Openings matched to the courses you're taking, pulled daily from the careers pages of companies we track. Apply on the company's own site."
      />
      <JobsPageContent />
    </div>
  );
}
