"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, PlayCircle } from "lucide-react";
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
import { CourseProgressList } from "@/modules/dashboard/components/CourseProgressList";
import { PageHeader } from "@/components/layout/page-header";
import { RevokedCourseNotice } from "@/modules/access/components/RevokedCourseNotice";
import {
  useMyPass,
  useSelfPacedCourses,
  useUpgradeCredits,
} from "@/modules/self-paced/api/self-paced.queries";
import { useLearnerShape } from "@/modules/self-paced/hooks/use-learner-shape";
import { pickContinueCourses } from "@/modules/self-paced/lib/continue-pick";
import { SELF_PACED_ROUTES } from "@/modules/self-paced/config/endpoints";
import { CourseCover } from "@/modules/self-paced/components/CourseCover";
import { ContinueSelfPacedCard } from "@/modules/self-paced/components/ContinueSelfPacedCard";
import { SelfPacedNudges } from "@/modules/self-paced/components/SelfPacedNudges";
import { PassMembershipCard } from "@/modules/self-paced/components/PassMembershipCard";
import { UpgradeCreditBanner } from "@/modules/self-paced/components/UpgradeCreditBanner";
import { formatDate, htmlToPlainText, pluralize } from "@/lib/utils";

/**
 * LMS home — "The Brief." A masthead greeting, an asymmetric hero
 * (continue learning) + ledger (upcoming deadlines) row, a bento row
 * of secondary widgets, then a magazine-index course list. See ADR 0018
 * for the direction and rationale.
 *
 * A self-paced-only learner (`useLearnerShape().selfPacedOnly`) has no
 * cohort: workload, calendar, deadlines and per-cohort progress are
 * absent for them rather than rendered empty, and their unfinished
 * self-paced course takes the hero slot.
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
    isError: isCoursesError,
    isFetching: isCoursesFetching,
    refetch: refetchCourses,
  } = useCourses();
  const { data: deadlines } = useUpcomingDeadlines(4);
  const { selfPacedOnly, hasSelfPaced } = useLearnerShape();
  const { data: selfPacedCourses } = useSelfPacedCourses();
  const { data: pass } = useMyPass();
  // Same query (and gate) UpgradeCreditBanner uses — read here only to
  // know whether the self-paced row has anything to show.
  const { data: credits } = useUpgradeCredits({
    enabled: hasSelfPaced || !!pass?.active,
  });
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
      qc.invalidateQueries({ queryKey: ["assignments"] }),
      qc.invalidateQueries({ queryKey: ["self-paced"] }),
    ]);
    setIsRefreshing(false);
  };

  const firstName = user?.firstName || user?.email?.split("@")[0] || "there";
  const continueLearning = courses?.[0];
  const enrolledCount = courses?.length || 0;
  const nextDeadline = deadlines?.[0];
  // The cohort course owns the hero when there is one; otherwise the
  // unfinished self-paced course does (always, for a self-paced-only
  // learner), and the self-paced tile below steps aside.
  const selfPacedNext = pickContinueCourses(selfPacedCourses ?? [])[0];
  const selfPacedHero = !continueLearning && !!selfPacedNext;
  const showSelfPacedTile = !!selfPacedNext && !selfPacedHero;
  const showSelfPacedRow =
    !selfPacedOnly &&
    (showSelfPacedTile || !!pass?.active || (credits?.length ?? 0) > 0);

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const selfPacedCount = selfPacedCourses?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        divider
        dateline={dateline}
        title={`Good ${timeOfDay()}, ${firstName}.`}
        description={
          selfPacedOnly ? (
            <>
              <strong className="text-foreground">{selfPacedCount}</strong>{" "}
              self-paced {pluralize(selfPacedCount, "course", undefined, false)} · pick up
              where you left off.
            </>
          ) : !isLoading ? (
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

      {/* TODO(D1/P1): mount <PushPermissionPrompt /> from
          modules/push/components/PushPermissionPrompt here, full width —
          it's a paragraph plus two buttons, not a compact tile, so it
          doesn't belong inside the "Needs a look" ledger. Self-gates to
          null. P1 is building it in a separate worktree; wire it after
          merging. */}

      {/* Reminders point at the same next lesson the hero / self-paced
          tile does, so they sit directly above it. Self-gating. */}
      <SelfPacedNudges />

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
        ) : selfPacedHero && selfPacedNext.nextLesson ? (
          <DashboardHero
            cover={
              <CourseCover
                imageUrl={selfPacedNext.imageUrl}
                name={selfPacedNext.name}
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="absolute inset-0 h-full"
              />
            }
            meta={`Self-paced · Up next: ${selfPacedNext.nextLesson.title}`}
            title={selfPacedNext.name}
            body={htmlToPlainText(selfPacedNext.description)}
            progress={selfPacedNext.progress.percent}
            progressLabel={`${selfPacedNext.progress.completedLessons}/${selfPacedNext.progress.totalLessons} lessons`}
            href={SELF_PACED_ROUTES.LESSON(selfPacedNext.slug, selfPacedNext.nextLesson.id)}
            cta={selfPacedNext.progress.completedLessons > 0 ? "Continue →" : "Start →"}
          />
        ) : selfPacedOnly ? (
          <EmptyState
            icon={PlayCircle}
            title="You're all caught up"
            description="Every self-paced course you hold is complete. Your certificates live on each course page."
            className="lg:min-h-[300px] lg:justify-center"
          />
        ) : isCoursesError ? (
          <EmptyState
            icon={BookOpen}
            title="Couldn't load your courses"
            description="Refresh to try again."
            className="lg:min-h-[300px] lg:justify-center"
          />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="You're not enrolled yet"
            description="Browse the catalog to find your first programme."
            className="lg:min-h-[300px] lg:justify-center"
          />
        )}

        {/* Deadlines are cohort-only; a self-paced-only learner gets the
            nags in this slot instead. */}
        {selfPacedOnly ? (
          <NeedsALook />
        ) : (
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
        )}
      </div>

      {selfPacedOnly ? (
        <>
          {/* Standing: pass membership, cohort upgrade credit, and the
              non-cohort extras. Each self-gates to null. */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <PassMembershipCard />
            <UpgradeCreditBanner />
            <DashboardWebinarsWidget />
            <DashboardAssignedModulesWidget />
          </div>
          <SelfPacedCourseIndex />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-[1.1fr_0.9fr_1.2fr]">
            <ProgressPulseCard />
            <DashboardStatsStrip />
            <NeedsALook />
          </div>

          {/* Self-paced alongside a cohort: the re-entry tile (unless the
              self-paced course already took the hero) plus pass and
              upgrade-credit standing. */}
          {showSelfPacedRow && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
              {showSelfPacedTile && <ContinueSelfPacedCard />}
              <div className="flex flex-col gap-5">
                <PassMembershipCard />
                <UpgradeCreditBanner />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
            <DashboardCalendarCard />
            <div className="flex flex-col gap-5">
              <CourseProgressList />
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

            {!isLoading && isCoursesError && (
              <p className="border-t border-border py-6 text-center text-sm text-muted-foreground">
                Couldn&apos;t load your courses. Refresh to try again.
              </p>
            )}

            {!isLoading && !isCoursesError && (!courses || courses.length === 0) && (
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
        </>
      )}
    </div>
  );
}

/** The self-gating status/opportunity nags, as rows in one ledger. */
function NeedsALook() {
  return (
    <Ledger title="Needs a look" empty="Nothing outstanding — you're all caught up.">
      <DashboardBillingWidget />
      <InternshipPaymentBannerCard />
      <AcceptanceLetterCard />
      <InternshipDashboardCard />
      <DashboardReferralsWidget />
      <TechScholarshipCard />
    </Ledger>
  );
}

/** "Your courses" for a self-paced-only learner: their self-paced
 *  courses as a magazine index, opening the course shell. */
function SelfPacedCourseIndex() {
  const { data, isLoading, isError } = useSelfPacedCourses();

  return (
    <section>
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Your courses</h2>
        <Link
          href={SELF_PACED_ROUTES.LIST}
          className="font-mono text-[11px] text-muted-foreground hover:text-foreground"
        >
          See all →
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3 pt-3">
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
        </div>
      )}

      {!isLoading && isError && (
        <p className="border-t border-border py-6 text-center text-sm text-muted-foreground">
          Couldn&apos;t load your self-paced courses. Refresh to try again.
        </p>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <IndexList>
          {data.map((c, i) => (
            <IndexRow
              key={c.id}
              index={i + 1}
              title={c.name}
              subtitle={`Self-paced · ${c.progress.completedLessons}/${c.progress.totalLessons} lessons`}
              progress={c.progress.percent}
              status={
                c.completedAt
                  ? "Completed"
                  : c.progress.completedLessons > 0
                    ? "Active"
                    : "Not started"
              }
              href={SELF_PACED_ROUTES.COURSE(c.slug)}
            />
          ))}
        </IndexList>
      )}
    </section>
  );
}

function timeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
