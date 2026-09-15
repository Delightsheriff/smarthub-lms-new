import type {
  ApiLessonCompletion,
  ApiLessonPlayback,
  ApiNudge,
  ApiPassState,
  ApiSelfPacedCourseDetail,
  ApiSelfPacedCourseSummary,
  ApiSelfPacedProgress,
  ApiUpgradeCredits,
} from "../types/api.types";
import type {
  LessonCompletionResult,
  LessonPlayback,
  PassState,
  SelfPacedCourse,
  SelfPacedCourseSummary,
  SelfPacedNudge,
  SelfPacedProgress,
  UpgradeCredit,
} from "../types";
import { nudgeHref } from "../lib/nudge-link";

const normaliseProgress = (p?: ApiSelfPacedProgress): SelfPacedProgress => ({
  totalLessons: p?.totalLessons ?? 0,
  completedLessons: p?.completedLessons ?? 0,
  percent: Math.min(100, Math.max(0, Math.round(p?.percent ?? 0))),
});

export const normaliseCourseSummary = (
  c: ApiSelfPacedCourseSummary
): SelfPacedCourseSummary => ({
  id: c._id,
  name: c.name,
  slug: c.slug,
  description: c.description ?? "",
  imageUrl: c.imageUrl || undefined,
  grantedAt: c.grantedAt,
  completedAt: c.completedAt,
  lastActivityAt: c.lastActivityAt,
  certificate: c.certificate,
  progress: normaliseProgress(c.progress),
  nextLesson: c.nextLesson
    ? { id: c.nextLesson._id, title: c.nextLesson.title }
    : undefined,
});

export const normaliseCourseDetail = (
  c: ApiSelfPacedCourseDetail
): SelfPacedCourse => ({
  id: c._id,
  name: c.name,
  slug: c.slug,
  description: c.description ?? "",
  overview: c.overview ?? "",
  imageUrl: c.imageUrl || undefined,
  difficulty: c.difficulty,
  whatsappGroupUrl: c.whatsappGroupUrl || undefined,
  cohortTrack: c.cohortTrack?.slug
    ? { name: c.cohortTrack.name || "the full programme", slug: c.cohortTrack.slug }
    : undefined,
  lessons: [...(c.lessons ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((l) => ({
      id: l._id,
      title: l.title,
      description: l.description ?? "",
      order: l.order,
      durationSeconds: l.durationSeconds ?? 0,
      durationMinutes: l.durationMinutes ?? 0,
      isPreview: !!l.isPreview,
      completed: !!l.completed,
      assetCount: l.assetCount ?? 0,
    })),
  faqs: [...(c.faqs ?? [])]
    .filter((f) => !!f?.question?.trim() && !!f.answer?.trim())
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((f) => ({ id: f._id, question: f.question, answer: f.answer })),
  progress: normaliseProgress(c.progress),
  nextLessonId: c.nextLessonId,
  completedAt: c.completedAt,
  certificate: c.certificate,
});

/**
 * The stream path is relative to the API root, and `<video>` needs an
 * absolute URL because it cannot go through the axios client (no auth
 * header — the token in the path is the credential).
 */
export const toApiUrl = (path: string): string => {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};
const toStreamUrl = toApiUrl;

export const normalisePlayback = (p: ApiLessonPlayback): LessonPlayback => {
  const expires = p.expiresAt ? new Date(p.expiresAt).getTime() : NaN;
  return {
    kind: p.kind,
    streamUrl: p.streamPath ? toStreamUrl(p.streamPath) : undefined,
    url: p.url || undefined,
    expiresAt: Number.isFinite(expires) ? expires : undefined,
    assets: (p.assets ?? [])
      .filter((a) => !!a?.url)
      .map((a, i) => ({
        label: a.label || `Resource ${i + 1}`,
        url: a.url,
        format: a.format,
      })),
  };
};

export const normaliseNudge = (n: ApiNudge): SelfPacedNudge => ({
  id: n._id,
  kind: n.kind,
  title: n.title || (n.course?.name ? `Keep going with ${n.course.name}` : "Keep going"),
  message: n.message ?? "",
  href: nudgeHref(n.actionUrl, n.course?.slug),
  course: n.course
    ? { id: n.course._id, name: n.course.name ?? "", slug: n.course.slug }
    : undefined,
  sentAt: n.sentAt,
});

/**
 * Only credits the learner can act on: `available`, not yet lapsed on
 * the client clock, and pointing at a cohort track with a public page
 * (or any cohort, for a pass). Soonest expiry first.
 */
export const normaliseUpgradeCredits = (
  r: ApiUpgradeCredits,
  now = Date.now()
): UpgradeCredit[] =>
  (r.credits ?? [])
    .filter((c) => c.state === "available")
    .filter((c) => !c.expiresAt || new Date(c.expiresAt).getTime() > now)
    .filter((c) => c.anyCohort || c.eligibleTracks?.some((t) => !!t.slug))
    .map((c) => ({
      orderId: c.orderId,
      itemName: c.itemName,
      expiresAt: c.expiresAt,
      valueMinor: c.valueMinor,
      currency: c.currency,
      anyCohort: !!c.anyCohort,
      eligibleTracks: (c.eligibleTracks ?? []).map((t) => ({
        id: t._id,
        name: t.name,
        slug: t.slug,
      })),
    }))
    .sort(
      (a, b) =>
        (a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity) -
        (b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity)
    );

export const normalisePass = (p: ApiPassState): PassState => ({
  active: !!p.active,
  expiresAt: p.expiresAt,
  renewalEndsAt: p.renewalEndsAt,
  excludes: p.excludes ?? [],
});

export const normaliseCompletion = (
  r: ApiLessonCompletion
): LessonCompletionResult => ({
  lessonId: r.lessonId,
  completed: r.completed,
  courseCompleted:
    typeof r.courseCompleted === "boolean" ? r.courseCompleted : undefined,
  progress: normaliseProgress(r.progress),
});
