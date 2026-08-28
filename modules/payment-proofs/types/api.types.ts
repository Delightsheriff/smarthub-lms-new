/**
 * smarthub-api wire shapes for the payment-proofs surface. Lifted out of
 * the legacy service file (they were module wire-types living in the
 * wrong file). All money is naira (`number`); all dates are ISO strings
 * here — each query `select` normalises the date fields to `Date`.
 */

export type PaymentProofStatus = "pending" | "confirmed" | "rejected";

export interface PayableRegistration {
  _id: string;
  courseName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentOption?: string;
  paymentStatus?: string;
}

export interface MyPaymentProof {
  _id: string;
  purpose: string;
  courseName?: string;
  amountClaimed: number;
  confirmedAmount?: number;
  screenshotUrl: string;
  reference?: string;
  status: PaymentProofStatus;
  reviewNotes?: string;
  createdAt?: string;
  reviewedAt?: string;
}

export type InstallmentStatus = "pending" | "paid" | "overdue" | "waived";

export interface PlanTranche {
  id: string;
  sequence: number;
  amount: number;
  dueDate: string;
  status: InstallmentStatus;
  paidAt?: string;
  graceEndsAt?: string;
}

export interface MyInstallmentPlan {
  id: string;
  enrollmentId: string;
  courseName?: string;
  origin: string;
  planType: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  amountDue: number;
  accessStatus: string;
  nextDue?: PlanTranche;
  installments: PlanTranche[];
}

export interface MyPaymentSurface {
  bank: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    paymentInstructions?: string;
  };
  registrations: PayableRegistration[];
  proofs: MyPaymentProof[];
}
