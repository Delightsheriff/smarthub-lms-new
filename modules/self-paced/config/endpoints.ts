import { LMS_PREFIX } from "@/lib/constants/api";

/** Self-paced delivery, under `/lms/self-paced/*`. Not behind the cohort
 *  payment gate — a self-paced buyer paid in full up front. */
export const SELF_PACED_ENDPOINTS = {
  COURSES: `${LMS_PREFIX}/self-paced/courses`,
  COURSE: (slug: string) =>
    `${LMS_PREFIX}/self-paced/courses/${encodeURIComponent(slug)}`,
  PLAYBACK: (lessonId: string) =>
    `${LMS_PREFIX}/self-paced/lessons/${lessonId}/playback`,
  COMPLETE: (lessonId: string) =>
    `${LMS_PREFIX}/self-paced/lessons/${lessonId}/complete`,
  /** POST — request (or poll) a name-watermarked offline copy. */
  DOWNLOAD: (lessonId: string) =>
    `${LMS_PREFIX}/self-paced/lessons/${lessonId}/download`,

  /** GET the caller's sent, undismissed reminders. */
  NUDGES: `${LMS_PREFIX}/self-paced/nudges`,
  /** POST — idempotent. */
  NUDGE_DISMISS: (id: string) => `${LMS_PREFIX}/self-paced/nudges/${id}/dismiss`,

  /** GET the caller's self-paced purchases as cohort upgrade credits. */
  UPGRADE_CREDIT: `${LMS_PREFIX}/self-paced/upgrade-credit`,
  /** GET the caller's all-access pass state. Answers even while the
   *  product is switched off — existing memberships are honoured. */
  PASS: `${LMS_PREFIX}/self-paced/pass`,

  // Instructor surface — `requireInstructorOrAdmin` on the API.
  /** GET own links + named self-paced courses without one; POST
   *  `{ courseId }` issues (or reactivates) the link for a course. */
  INSTRUCTOR_LINKS: `${LMS_PREFIX}/self-paced/instructor/links`,
  INSTRUCTOR_LINK_REVOKE: (linkId: string) =>
    `${LMS_PREFIX}/self-paced/instructor/links/${linkId}/revoke`,
  /** GET orders attributed to the caller's links (paid + refunded). */
  INSTRUCTOR_ORDERS: `${LMS_PREFIX}/self-paced/instructor/orders`,
  /** GET the caller's revenue-share totals, per course, and recent shares. */
  INSTRUCTOR_EARNINGS: `${LMS_PREFIX}/self-paced/instructor/earnings`,
} as const;

/** Learner-facing routes inside this app. */
export const SELF_PACED_ROUTES = {
  LIST: "/learn",
  COURSE: (slug: string) => `/learn/${slug}`,
  LESSON: (slug: string, lessonId: string) =>
    `/learn/${slug}/lessons/${lessonId}`,
  /** Instructor: referral links, attributed sales, revenue share. */
  INSTRUCTOR: "/teach/self-paced",
} as const;
