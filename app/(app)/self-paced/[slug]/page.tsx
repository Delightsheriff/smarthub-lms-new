import { redirect } from "next/navigation";
import { SELF_PACED_ROUTES } from "@/modules/self-paced/config/endpoints";
import { nudgeHref } from "@/modules/self-paced/lib/nudge-link";

/**
 * smarthub-api deep-links self-paced reminders (in-app notifications) as
 * `/self-paced/:slug?lesson=:lessonId`. Self-paced lives under `/learn`
 * here, so forward rather than 404 from the notification bell.
 */
export default async function SelfPacedLegacyLink({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string | string[] }>;
}) {
  const { slug } = await params;
  const { lesson } = await searchParams;
  const lessonId = Array.isArray(lesson) ? lesson[0] : lesson;
  const query = lessonId ? `?lesson=${encodeURIComponent(lessonId)}` : "";
  redirect(
    nudgeHref(`/self-paced/${encodeURIComponent(slug)}${query}`, slug) ??
      SELF_PACED_ROUTES.COURSE(slug)
  );
}
