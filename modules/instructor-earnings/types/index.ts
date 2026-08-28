/**
 * Instructor-earnings wire shapes. The API returns these envelopes 1:1 —
 * no normaliser (see Plan 009 §6.5.1). Only the screen-ready surface is
 * mirrored here.
 */

import type {
  CompensationModel,
  EarningStream,
} from "@/lib/api/constants";

export type { EarningStream, CompensationModel, InstructorRole } from "@/lib/api/constants";

export interface EarningsTotals {
  pendingNaira: number;
  processingNaira: number;
  paidNaira: number;
}

export interface EarningsByKind {
  baseNaira: number;
  variableNaira: number;
  bonusNaira: number;
}

export interface EarningsCohortRow {
  scheduleId?: string;
  course: string;
  stream?: EarningStream;
  startDate?: string;
  endDate?: string;
  pending: number;
  paid: number;
}

export interface EarningsPayout {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt?: string;
  processedAt?: string;
  bankName?: string;
}

export interface InstructorEarnings {
  totals: EarningsTotals;
  byKind?: EarningsByKind;
  cohorts: EarningsCohortRow[];
  payouts: EarningsPayout[];
}

export interface BreakdownStudent {
  name: string;
  email?: string;
  paidNaira: number;
  yourCutNaira?: number;
}

export interface BreakdownCohort {
  scheduleId: string;
  course: string;
  model: CompensationModel;
  isFlat: boolean;
  effectiveSharePct: number;
  yourEntitlementNaira: number;
  totalRevenueNaira: number;
  students: BreakdownStudent[];
}
