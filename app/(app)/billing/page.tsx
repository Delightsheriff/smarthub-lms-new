"use client";
import { BillingPageContent } from "@/modules/billing/components/BillingPageContent";
import { InstructorEarningsPageContent } from "@/modules/instructor-earnings/components/InstructorEarningsPageContent";
import { useEffectiveMode } from "@/hooks/use-effective-mode";

/**
 * Same slot, two surfaces. Student mode → enrolment billing. Instructor
 * mode → the read-only earnings dashboard (accrued / processing / paid,
 * per-cohort breakdown, payout history). Payouts are run by an admin —
 * nothing to request here.
 */
export default function BillingPage() {
  const { mode } = useEffectiveMode();
  if (mode === "instructor") return <InstructorEarningsPageContent />;
  return <BillingPageContent />;
}