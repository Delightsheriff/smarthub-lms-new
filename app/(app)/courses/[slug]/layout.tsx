"use client";
import { use, useState, type ReactNode } from "react";
import { ArrowLeft, ListTree } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseOutline } from "@/modules/courses/components/course-outline";
import { useCourseBySlug } from "@/modules/courses/api/courses.queries";

/**
 * Layout shell for `/courses/[slug]/...`. Two-pane on desktop (course
 * outline rail + main content); single-pane on mobile with a "Course
 * outline" button that opens a Sheet drawer carrying the same outline.
 *
 * The outline is shared — same `CourseOutline` instance, two surfaces.
 */
export default function CourseLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data, isLoading } = useCourseBySlug(slug);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The detail endpoint embeds each module's recordings/materials/
  // assignments, so the outline list is fully populated for every
  // module on first paint — no per-module fan-out needed here.
  const modulesForOutline = data?.modules ?? [];

  return (
    <div className="space-y-4 -mt-2">
      {/* Back link + mobile drawer trigger.
          Sits inside the existing app `<main>` container. */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All courses
        </Link>

        {/* Mobile-only outline trigger */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden gap-2 text-xs"
              >
                <ListTree className="h-3.5 w-3.5" />
                Course outline
              </Button>
            }
          />
          <SheetContent side="left" className="p-0">
            <SheetHeader>
              <SheetTitle>{data?.course.name || "Course outline"}</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-[calc(100dvh-65px)]">
              {isLoading ? (
                <OutlineSkeleton />
              ) : data ? (
                <CourseOutline
                  slug={slug}
                  modules={modulesForOutline}
                  courseProgress={data.course.progress}
                  onItemClick={() => setDrawerOpen(false)}
                />
              ) : null}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Two-pane split. Side rail visible at lg+ only because the
          main app shell already eats up 72px on md for its side rail. */}
      <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-6">
        <aside className="hidden lg:block sticky top-20 h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl border bg-card">
          {isLoading ? (
            <OutlineSkeleton />
          ) : data ? (
            <CourseOutline
              slug={slug}
              modules={modulesForOutline}
              courseProgress={data.course.progress}
            />
          ) : null}
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

function OutlineSkeleton() {
  return (
    <div className="p-3 space-y-2">
      <Skeleton className="h-9 w-full rounded-lg" />
      <Skeleton className="h-9 w-full rounded-lg" />
      <Skeleton className="h-9 w-full rounded-lg" />
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  );
}
