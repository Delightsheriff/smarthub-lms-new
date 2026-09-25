"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Ledger, LedgerItem } from "@/components/ui/ledger";
import { IndexList, IndexRow } from "@/components/ui/index-list";
import { EmptyState } from "@/components/ui/empty-state";
import { TeachPageContent } from "@/modules/teaching/components/TeachPageContent";
import { useEffectiveMode } from "@/hooks/use-effective-mode";
import { useAuthStore } from "@/store/slices/authStore";
import { useCourses } from "@/modules/courses/api/courses.queries";
import { useUpcomingDeadlines } from "@/modules/assignments/api/assignments.queries";
import { getDeadlineStatus } from "@/modules/assignments/components/countdown-to-deadline";
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
import { DashboardStatsStrip } from "@/modules/dashboard/components/StatsStrip";
import { DashboardHero } from "@/modules/dashboard/components/DashboardHero";
import { PageHeader } from "@/components/layout/page-header";
import { RevokedCourseNotice } from "@/modules/access/components/RevokedCourseNotice";
import { formatDate, htmlToPlainText, pluralize } from "@/lib/utils";

/**
 * LMS home — "The Brief." A masthead greeting, an asymmetric hero
 * (continue learning) + ledger (upcoming deadlines) row, a bento row
 * of secondary widgets, then a magazine-index course list. Replaces
 * the earlier ten-stacked-cards layout; see plans/020-editorial-
 * dashboard-system.md for the direction and rationale.
 */
export default function DashboardPage() {
  const { mode } = useEffectiveMode();
  if (mode === "instructor") return <TeachPageContent />;
  return <StudentDashboardBody />;
}

function StudentDashboardBody() {
  const user = useAuthStore((s) => s.user);
  const {
    data: courses,
    isLoading,
    isFetching: isCoursesFetching,
    refetch: refetchCourses,
  } = useCourses();
  const { data: deadlines } = useUpcomingDeadlines(4);
  const qc = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      refetchCourses(),
      qc.invalidateQueries({ queryKey: ["courses"] }),
      qc.invalidateQueries({ queryKey: ["billing"] }),
      qc.invalidateQueries({ queryKey: ["calendar"] }),
      qc.invalidateQueries({ queryKey: ["progress"] }),
      qc.invalidateQueries({ queryKey: ["internships"] }),
      qc.invalidateQueries({ queryKey: ["webinars"] }),
      qc.invalidateQueries({ queryKey: ["assigned-modules"] }),
      qc.invalidateQueries({ queryKey: ["acceptance-letters"] }),
      qc.invalidateQueries({ queryKey: ["referrals"] }),
      qc.invalidateQueries({ queryKey: ["scholarship"] }),
      qc.invalidateQueries({ queryKey: ["access"] }),
    ]);
    setIsRefreshing(false);
  };

  const firstName = user?.firstName || user?.email?.split("@")[0] || "there";
  const continueLearning = courses?.[0];
  const enrolledCount = courses?.length || 0;
  const nextDeadline = deadlines?.[0];

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        divider
        dateline={dateline}
        title={`Good ${timeOfDay()}, ${firstName}.`}
        description={
          !isLoading ? (
            enrolledCount === 0 ? (
              "You're not enrolled in any courses yet."
            ) : (
              <>
                <strong className="text-foreground">{enrolledCount}</strong>{" "}
                {pluralize(enrolledCount, "course", undefined, false)} in progress
                {nextDeadline && (
                  <>
                    {" "}
                    · next deadline in{" "}
                    <strong className="text-foreground">
                      {getDeadlineStatus(nextDeadline.assignment.dueAt).label.replace(/^Due in |^Past due by /, "")}
                    </strong>
                  </>
                )}
              </>
            )
          ) : undefined
        }
        actions={
          <RefreshButton
            loading={isCoursesFetching || isRefreshing}
            onClick={handleRefresh}
          />
        }
      />

      <RevokedCourseNotice />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr] lg:items-stretch">
        {continueLearning ? (
          <DashboardHero
            cover={
              continueLearning.imageUrl ? (
                <Image
                  src={continueLearning.imageUrl}
                  alt={continueLearning.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              ) : undefined
            }
            meta={[continueLearning.mode, formatDate(continueLearning.startDate)]
              .filter(Boolean)
              .join(" · ")}
            title={continueLearning.name}
            body={htmlToPlainText(continueLearning.description)}
            progress={continueLearning.progress}
            href={`/courses/${continueLearning.slug}`}
          />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="You're not enrolled yet"
            description="Browse the catalog to find your first programme."
            className="lg:min-h-[300px] lg:justify-center"
          />
        )}

        <Ledger title="Today & upcoming" count={deadlines?.length || undefined}>
          {(deadlines || []).map(({ assignment, course }) => {
            const status = getDeadlineStatus(assignment.dueAt);
            return (
              <LedgerItem
                key={assignment.id}
                tone={status.isOverdue || status.isUrgent ? "due" : "info"}
                title={assignment.title}
                meta={course?.name || "Course"}
                when={status.label.replace(/^Due in |^Past due by /, "")}
                href="/assignments"
              />
            );
          })}
        </Ledger>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-[1.1fr_0.9fr_1.2fr]">
        <ProgressPulseCard />
        <DashboardStatsStrip />
        <Ledger title="Needs a look" empty="Nothing outstanding — you're all caught up.">
          <DashboardBillingWidget />
          <InternshipPaymentBannerCard />
          <AcceptanceLetterCard />
          <InternshipDashboardCard />
          <DashboardReferralsWidget />
          <TechScholarshipCard />
        </Ledger>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
        <DashboardCalendarCard />
        <div className="flex flex-col gap-5">
          <DashboardWebinarsWidget />
          <DashboardAssignedModulesWidget />
        </div>
      </div>

      <section>
        <div className="mb-1 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">Your courses</h2>
          <Link href="/courses" className="font-mono text-[11px] text-muted-foreground hover:text-foreground">
            See all →
          </Link>
        </div>

        {isLoading && (
          <div className="space-y-3 pt-3">
            <div className="h-16 animate-pulse rounded-xl bg-muted" />
            <div className="h-16 animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {!isLoading && (!courses || courses.length === 0) && (
          <EmptyState
            icon={BookOpen}
            title="You're not enrolled yet"
            description="Browse the catalog to find your first programme."
          />
        )}

        {!isLoading && courses && courses.length > 0 && (
          <IndexList>
            {courses.map((c, i) => (
              <IndexRow
                key={c.id}
                index={i + 1}
                title={c.name}
                subtitle={[c.mode, c.durationLabel].filter(Boolean).join(" · ")}
                progress={c.progress}
                status={c.status === "in-progress" ? "Active" : c.status === "completed" ? "Ended" : "Not started"}
                href={`/courses/${c.slug}`}
              />
            ))}
          </IndexList>
        )}
      </section>
    </div>
  );
}

function timeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
