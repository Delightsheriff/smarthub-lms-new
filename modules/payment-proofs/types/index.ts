/**
 * UI shapes the payment-proofs components consume. Date fields are
 * normalised from ISO strings to `Date` at the query `select`, so the
 * schedule card / gate never parse ISO strings themselves.
 */

import type {
  InstallmentStatus,
  PayableRegistration,
  PaymentProofStatus,
} from "./api.types";

export type { PaymentProofStatus, InstallmentStatus } from "./api.types";

/** A tranche as the UI consumes it — dates as `Date`. */
export interface PlanTrancheUi {
  id: string;
  sequence: number;
  amount: number;
  dueDate: Date;
  status: InstallmentStatus;
  paidAt?: Date;
  graceEndsAt?: Date;
}

/** An installment plan as the UI consumes it. */
export interface MyInstallmentPlanUi {
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
  nextDue?: PlanTrancheUi;
  installments: PlanTrancheUi[];
}

/** A payment proof as the UI consumes it — dates as `Date`. */
export interface MyPaymentProofUi {
  _id: string;
  purpose: string;
  courseName?: string;
  amountClaimed: number;
  confirmedAmount?: number;
  screenshotUrl: string;
  reference?: string;
  status: PaymentProofStatus;
  reviewNotes?: string;
  createdAt?: Date;
  reviewedAt?: Date;
}

export interface MyPaymentSurfaceUi {
  bank: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    paymentInstructions?: string;
  };
  registrations: PayableRegistration[];
  proofs: MyPaymentProofUi[];
}

export type {
  PayableRegistration,
  MyPaymentProof,
  MyInstallmentPlan,
  PlanTranche,
  MyPaymentSurface,
} from "./api.types";


