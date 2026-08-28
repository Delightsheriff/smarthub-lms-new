"use client";
import { use } from "react";
import { CourseModulePageContent } from "@/modules/courses/components/CourseModulePageContent";

export default function ModulePage({
  params,
}: {
  params: Promise<{ slug: string; moduleSlug: string }>;
}) {
  const { slug, moduleSlug } = use(params);
  return <CourseModulePageContent slug={slug} moduleSlug={moduleSlug} />;
}
