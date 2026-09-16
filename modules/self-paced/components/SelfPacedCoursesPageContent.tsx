"use client";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { publicSiteOrigin } from "@/lib/public-origin";
import { useSelfPacedCourses } from "../api/self-paced.queries";
import { SelfPacedCoursesSection } from "./SelfPacedCoursesSection";

export function SelfPacedCoursesPageContent() {
  const { data, isLoading, isError } = useSelfPacedCourses();
  const empty = !isLoading && !isError && (data?.length ?? 0) === 0;

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        variant="editorial"
        eyebrow="Learning"
        title="Self-paced courses"
        description="Work through lessons in order and pick up exactly where you left off."
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
