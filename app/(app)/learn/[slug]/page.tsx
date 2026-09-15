import { SelfPacedCoursePageContent } from "@/modules/self-paced/components/SelfPacedCoursePageContent";

export const metadata = { title: "Course" };

export default async function SelfPacedCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SelfPacedCoursePageContent slug={slug} />;
}
