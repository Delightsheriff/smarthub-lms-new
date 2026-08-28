/** UI shapes the billing components consume. */

export type PaymentStatus =
  | "pending"
  | "completed"
  | "cancelled"
  | "refunded"
  // Admin granted a full waiver (e.g. staff scholarship). The student
  // has full LMS access; remaining/paid are bookkeeping only.
  | "waived";

export interface BillingPayment {
  id: string;
  amount: number;
  paidAt: string;
}

export interface BillingRegistrationCard {
  id: string;
  courseName: string;
  courseMode?: string;
  cohortLabel: string; // e.g. "Nov 24, 2025 cohort · 6 months"
  paymentStatus: PaymentStatus;
  paymentOption: "installment" | "full";
  /** Post-discount effective price — render this as "what you owe". */
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentProgress: number; // 0-100
  /** Pre-discount list price, struck-through next to `totalAmount`. */
  coursePrice?: number;
  /** Naira-resolved discount. Presence (> 0) toggles discount UI. */
  discountAmount?: number;
  discountKind?: "amount" | "percent";
  discountValue?: number;
  discountReason?: string;
  discountNote?: string;
  nextPaymentDue?: string | null;
  payments: BillingPayment[];
}

export interface BillingBreakdown {
  overall: {
    totalPaid: number;
    totalDue: number;
    totalAmount: number;
    totalDiscount?: number;
    paymentProgress: number;
    nextPaymentDue?: string | null;
  };
  registrations: BillingRegistrationCard[];
}

export type {
  ApiBillingBreakdown,
  ApiBillingSummary,
  ApiBillingPayment,
  ApiBillingRegistration,
} from "./api.types";
