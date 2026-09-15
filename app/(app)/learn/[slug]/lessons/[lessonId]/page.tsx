import { LessonPlayerPageContent } from "@/modules/self-paced/components/LessonPlayerPageContent";

export const metadata = { title: "Lesson" };

export default async function SelfPacedLessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  return (
    <LessonPlayerPageContent key={lessonId} slug={slug} lessonId={lessonId} />
  );
}
