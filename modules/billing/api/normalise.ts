import type {
  ApiBillingBreakdown,
  ApiBillingRegistration,
} from "../types/api.types";
import type { BillingBreakdown, BillingRegistrationCard } from "../types";

const formatCohortLabel = (
  startDate?: string,
  duration?: string,
): string => {
  if (!startDate) return duration || "Cohort";
  const d = new Date(startDate);
  if (Number.isNaN(d.getTime())) return duration || "Cohort";
  const formatted = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return duration ? `${formatted} cohort · ${duration}` : `${formatted} cohort`;
};

const calcProgress = (paid: number, total: number) => {
  if (total <= 0) return 0;
  // Clamp to 0–100 — overpaid tranches and stale balances must never
  // render a progress bar past 100% (or below 0 for odd inputs).
  return Math.min(100, Math.max(0, Math.round((paid / total) * 100)));
};

export function normaliseRegistration(
  api: ApiBillingRegistration,
): BillingRegistrationCard {
  const paymentProgress = calcProgress(api.paidAmount, api.totalAmount);
  // The API omits discount fields when nothing's discounted, so their
  // presence (`discountAmount > 0`) is the toggle for the discount UI.
  return {
    id: api._id,
    courseName: api.course?.name || "Untitled course",
    courseMode: api.course?.mode,
    cohortLabel: formatCohortLabel(
      api.schedule?.startDate,
      api.schedule?.duration,
    ),
    paymentStatus:
      (api.paymentStatus as BillingRegistrationCard["paymentStatus"]) ||
      "pending",
    paymentOption:
      (api.paymentOption as BillingRegistrationCard["paymentOption"]) ||
      "full",
    totalAmount: api.totalAmount || 0,
    paidAmount: api.paidAmount || 0,
    remainingAmount: api.remainingAmount || 0,
    paymentProgress,
    coursePrice: api.coursePrice,
    discountAmount: api.discountAmount,
    discountKind: api.discountKind,
    discountValue: api.discountValue,
    discountReason: api.discountReason,
    discountNote: api.discountNote,
    nextPaymentDue: api.nextPaymentDue || null,
    payments: (api.payments || []).map((p) => ({
      id: p._id,
      amount: p.amount,
      paidAt: p.paymentDate,
    })),
  };
}

export function normaliseBreakdown(
  api: ApiBillingBreakdown,
): BillingBreakdown {
  return {
    overall: {
      totalPaid: api.overall?.totalPaid || 0,
      totalDue: api.overall?.totalDue || 0,
      totalAmount: api.overall?.totalAmount || 0,
      totalDiscount: api.overall?.totalDiscount || 0,
      paymentProgress: api.overall?.paymentProgress || 0,
      nextPaymentDue: api.overall?.nextPaymentDue || null,
    },
    registrations: (api.registrations || []).map(normaliseRegistration),
  };
}
