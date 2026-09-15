import { SELF_PACED_ROUTES } from "../config/endpoints";

const OBJECT_ID = /^[a-f0-9]{24}$/i;

/**
 * Where a nudge should take the learner inside this app.
 *
 * The API now writes `actionUrl` as `/learn/:slug` or
 * `/learn/:slug/lessons/:lessonId`, which passes through unchanged.
 * Nudges sent before that change carry `/self-paced/:slug?lesson=:id`,
 * which is not a route here, so it is translated. Anything else
 * (including a `/learn/` link with no slug) falls back to the course
 * page when the nudge names a course.
 */
export function nudgeHref(
  actionUrl: string | undefined,
  courseSlug: string | undefined
): string | undefined {
  if (actionUrl && /^\/learn\/[^/?#]+/.test(actionUrl)) return actionUrl;

  const m = actionUrl
    ? /^\/self-paced\/([^/?#]+)\/?(?:\?(.*))?$/.exec(actionUrl)
    : null;
  if (m?.[1]) {
    const slug = decodeURIComponent(m[1]);
    const lesson = new URLSearchParams(m[2] ?? "").get("lesson");
    return lesson && OBJECT_ID.test(lesson)
      ? SELF_PACED_ROUTES.LESSON(slug, lesson)
      : SELF_PACED_ROUTES.COURSE(slug);
  }
  return courseSlug ? SELF_PACED_ROUTES.COURSE(courseSlug) : undefined;
}
