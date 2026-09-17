"use client";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { RefreshButton } from "@/components/ui/refresh-button";
import { publicSiteOrigin } from "@/lib/public-origin";
import { useSelfPacedCourses } from "../api/self-paced.queries";
import { SelfPacedCoursesSection } from "./SelfPacedCoursesSection";

export function SelfPacedCoursesPageContent() {
  const { data, isLoading, isFetching, isError, refetch } = useSelfPacedCourses();
  const empty = !isLoading && !isError && (data?.length ?? 0) === 0;

  const count = data?.length ?? 0;
  const dateline = data ? `${count} Course${count === 1 ? "" : "s"} Enrolled` : undefined;

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        variant="editorial"
        eyebrow="Learning"
        title="Self-paced courses"
        dateline={dateline}
        divider
        description="Work through lessons in order, track your progress, and pick up exactly where you left off."
        actions={<RefreshButton loading={isFetching} onClick={refetch} />}
      />

      {empty ? (
        <EmptyState
          icon={PlayCircle}
          title="No self-paced courses yet"
          description="Courses you buy appear here straight away."
          action={
            <Button
              variant="outline"
              size="sm"
              render={
                <a href={publicSiteOrigin()} target="_blank" rel="noopener noreferrer">
                  Browse courses
                </a>
              }
            />
          }
        />
      ) : (
        <SelfPacedCoursesSection title={null} description={null} />
      )}
    </div>
  );
}
