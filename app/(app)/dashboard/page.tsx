"use client";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ComingSoon } from "@/components/layout/coming-soon";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { useAuthStore } from "@/store/slices/authStore";
import { useCourses } from "@/modules/courses/api/courses.queries";
import { CourseCard } from "@/modules/courses/components/CourseCard";
import { AcceptanceLetterCard } from "@/modules/acceptance-letters/components/AcceptanceLetterCard";
import { DashboardBillingWidget } from "@/modules/billing/components/DashboardBillingWidget";
import { DashboardReferralsWidget } from "@/modules/referrals/components/DashboardReferralsWidget";
import { InternshipDashboardCard } from "@/modules/internships/components/InternshipDashboardCard";
import { InternshipPaymentBannerCard } from "@/modules/internships/components/payment/InternshipPaymentBannerCard";
import { TechScholarshipCard } from "@/modules/tech-scholarship/components/TechScholarshipCard";
import { DashboardWebinarsWidget } from "@/modules/webinars/components/DashboardWebinarsWidget";
import { DashboardAssignedModulesWidget } from "@/modules/assigned-modules/components/DashboardAssignedModulesWidget";
import { ProgressPulseCard } from "@/modules/progress/components/ProgressPulseCard";
import { DashboardCalendarCard } from "@/modules/calendar/components/DashboardCalendarCard";
import { UpcomingDeadlinesPanel } from "@/modules/calendar/components/UpcomingDeadlinesPanel";
import { DashboardStatsStrip } from "@/modules/dashboard/components/StatsStrip";
import { CourseProgressList } from "@/modules/dashboard/components/CourseProgressList";
import { formatDate, htmlToPlainText } from "@/lib/utils";

/**
 * LMS dashboard. Ordering follows a "what does the student need right
 * now?" pyramid — most action-oriented surfaces at the top, browse
 * surfaces at the bottom:
 *
 *   1. Greeting (single line — no separate card)
 *   2. Status nags — billing, referrals (auto-fit grid). Each self-
 *      gates; the slot collapses when nothing's outstanding.
 *   3. Stats strip — workload at a glance (to-do / awaiting / reviewed
 *      / overdue).
 *   4. Progress pulse — personal stats + cohort + recent badges.
 *   5. Upcoming webinars — self-gating preview.
 *   6. Assigned to you — extra standalone modules.
 *   7. Continue learning — primary re-entry CTA.
 *   8. Upcoming deadlines — action-focused "what to submit next".
 *   9. Progress by course — completion breakdown per enrolment.
 *  10. Your courses — browse-all surface.
 */
export default function DashboardPage() {
  const { mode } = useEffectiveMode();
  // Instructor mode is deferred to Plan 011 (teaching dashboard). The
  // shell stays in-place with a clear placeholder so the nav slot reads
  // sensibly in either role.
  if (mode === "instructor") return <ComingSoon title="Teaching dashboard" />;
  return <StudentDashboardBody />;
}

function StudentDashboardBody() {
  const user = useAuthStore((s) => s.user);
  const { data: courses, isLoading } = useCourses();

  const firstName =
    user?.firstName || user?.email?.split("@")[0] || "there";
  const continueLearning = courses?.[0];
  const enrolledCount = courses?.length || 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Hi {firstName} 👋
        </h1>
        {!isLoading && (
          <p className="text-sm text-muted-foreground mt-1">
            {enrolledCount === 0
              ? "You're not enrolled in any courses yet."
              : `${enrolledCount} ${
                  enrolledCount === 1 ? "course" : "courses"
                } enrolled · pick up where you left off.`}
          </p>
        )}
      </header>

      {/* Status nags — each self-gates; the row collapses when nothing's
          outstanding. */}
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        <DashboardBillingWidget />
        <AcceptanceLetterCard />
        <DashboardReferralsWidget />
        <InternshipPaymentBannerCard />
        <InternshipDashboardCard />
        <TechScholarshipCard />
      </div>

      <DashboardStatsStrip />

      <ProgressPulseCard />

      <DashboardWebinarsWidget />

      <DashboardAssignedModulesWidget />

      {continueLearning && (
        <section>
          <header className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Continue learning</h2>
            <Sparkles className="h-4 w-4 text-primary" />
          </header>
          <Card className="p-0 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
            <div className="md:grid md:grid-cols-[200px_1fr]">
              <div className="relative h-32 md:h-full w-full bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10">
                {continueLearning.imageUrl ? (
                  <Image
                    src={continueLearning.imageUrl}
                    alt={continueLearning.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 200px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-primary/30" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <Badge variant="default" className="mb-2">
                  Pick up
                </Badge>
                <h3 className="font-semibold text-lg leading-tight mb-1">
                  {continueLearning.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {htmlToPlainText(continueLearning.description)}
                </p>
                <div className="flex items-center justify-end text-xs mb-4">
                  <span className="text-muted-foreground inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Started {formatDate(continueLearning.startDate)}
                  </span>
                </div>
                <Button
                  render={<Link href={`/courses/${continueLearning.slug}`} />}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Resume
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCalendarCard />
        </div>
        <div>
          <UpcomingDeadlinesPanel />
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">Progress by course</h2>
        <CourseProgressList />
      </section>

      <section>
        <header className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Your courses</h2>
          <Link
            href="/courses"
            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </header>

        {isLoading && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        )}

        {!isLoading && (!courses || courses.length === 0) && (
          <Card className="p-8 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">You&apos;re not enrolled yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Browse the catalog to find your first programme.
            </p>
          </Card>
        )}

        {!isLoading && courses && courses.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {courses.slice(0, 2).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
