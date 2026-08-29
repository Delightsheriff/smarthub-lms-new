"use client";
import { useParams } from "next/navigation";
import { CohortEarningsDetailContent } from "@/modules/instructor-earnings/components/CohortEarningsDetailContent";

export default function CohortEarningsDetailPage() {
  const params = useParams<{ scheduleId: string }>();
  const scheduleId = params?.scheduleId ?? "";
  return scheduleId ? (
    <CohortEarningsDetailContent scheduleId={scheduleId} />
  ) : null;
}