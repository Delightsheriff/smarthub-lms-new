"use client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelfPacedCourses } from "../api/self-paced.queries";
import { SelfPacedCourseCard } from "./SelfPacedCourseCard";

/**
 * The learner's self-paced courses as a labelled grid. Renders nothing
 * when there are none — on the shared course list an empty "Self-paced"
 * heading would read as a feature they're missing out on.
 */
export function SelfPacedCoursesSection({
  title = "Self-paced",
  description = "Learn at your own pace. Your place is saved lesson by lesson.",
}: {
  title?: string | null;
  description?: string | null;
}) {
  const { data, isLoading, isError } = useSelfPacedCourses();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="aspect-4/5 w-full rounded-2xl" />
        <Skeleton className="aspect-4/5 w-full rounded-2xl hidden sm:block" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-5 border-destructive/30 bg-destructive/5">
        <p className="text-sm text-destructive">
          Couldn&apos;t load your self-paced courses. Try refreshing.
        </p>
      </Card>
    );
  }

  if (!data?.length) return null;

  return (
    <section className="space-y-3">
      {(title || description) && (
        <header>
          {title && <h2 className="font-semibold">{title}</h2>}
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </header>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.map((c) => (
          <SelfPacedCourseCard key={c.id} course={c} />
        ))}
      </div>
    </section>
  );
}
