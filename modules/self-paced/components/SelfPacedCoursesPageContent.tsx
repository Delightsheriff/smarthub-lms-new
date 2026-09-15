"use client";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { publicSiteOrigin } from "@/lib/public-origin";
import { useSelfPacedCourses } from "../api/self-paced.queries";
import { SelfPacedCoursesSection } from "./SelfPacedCoursesSection";

export function SelfPacedCoursesPageContent() {
  const { data, isLoading, isError } = useSelfPacedCourses();
  const empty = !isLoading && !isError && (data?.length ?? 0) === 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Self-paced courses
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Work through lessons in order and pick up exactly where you left off.
        </p>
      </header>

      {empty ? (
        <Card className="p-10 text-center">
          <PlayCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">No self-paced courses yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Courses you buy appear here straight away.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            render={
              <a href={publicSiteOrigin()} target="_blank" rel="noopener noreferrer">
                Browse courses
              </a>
            }
          />
        </Card>
      ) : (
        <SelfPacedCoursesSection title={null} description={null} />
      )}
    </div>
  );
}
