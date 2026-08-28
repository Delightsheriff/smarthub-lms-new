/**
 * smarthub-api shapes for the billing surface. Conservative — only
 * what the LMS reads. Server-side fields like `transactionReference`
 * exist but aren't surfaced yet.
 */

export interface ApiBillingSummary {
  totalPaid: number;
  totalDue: number;
  totalAmount: number;
  paymentProgress: number;
  nextPaymentDue?: {
    amount: number;
    dueDate: string;
    course: string;
  } | null;
  recentPayments?: Array<{
    _id: string;
    amount: number;
    paymentDate: string;
    registration?: { course?: { name?: string } };
  }>;
}

export interface ApiBillingPayment {
  _id: string;
  amount: number;
  paymentDate: string;
}

export interface ApiBillingRegistration {
  _id: string;
  course: {
    _id?: string;
    name?: string;
    nameSlug?: string;
    mode?: string;
  } | null;
  schedule: {
    _id?: string;
    startDate?: string;
    duration?: string;
  } | null;
  paymentStatus:
    | "pending"
    | "completed"
    | "cancelled"
    | "refunded"
    | string;
  paymentOption: "installment" | "full" | string;
  /** Post-discount effective total. */
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  /** Pre-discount list price. Only present when a discount applies. */
  coursePrice?: number;
  /** Naira-resolved discount amount. Present only when > 0 — its
   *  presence is the "show discount UI" flag. */
  discountAmount?: number;
  discountKind?: "amount" | "percent";
  discountValue?: number;
  discountReason?: string;
  discountNote?: string;
  nextPaymentDue?: string | null;
  payments: ApiBillingPayment[];
}

export interface ApiBillingBreakdown {
  overall: {
    totalPaid: number;
    totalDue: number;
    totalAmount: number;
    /** Sum of every per-registration discount. > 0 powers a
     *  "you saved ₦X" line on the summary card. */
    totalDiscount?: number;
    paymentProgress: number;
    nextPaymentDue?: string | null;
  };
  registrations: ApiBillingRegistration[];
}
