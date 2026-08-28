"use client";
import { use } from "react";
import { CourseDetailPageContent } from "@/modules/courses/components/CourseDetailPageContent";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <CourseDetailPageContent slug={slug} />;
}
