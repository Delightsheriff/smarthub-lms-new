/**
 * Public shapes for the referrals module. These mirror the consumer
 * client's `/account/*` envelope verbatim — the LMS reads the same
 * endpoints.
 */

export interface BankingDetails {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  payoutEmail?: string;
  updatedAt?: string;
}

export type BankingDetailsPatch = Omit<BankingDetails, "updatedAt">;

export interface AccountMe {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  referralCode?: string;
  referredByCode?: string;
  hasPassword?: boolean;
  bankingDetails?: BankingDetails;
  [k: string]: unknown;
}

export interface ReferralRecord {
  _id: string;
  status: string;
  commission?: number;
  amount?: number;
  firstPaymentAmount?: number;
  referred?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  potentialAmount?: number;
  registration?: {
    course?:
      | { _id: string; name?: string; nameSlug?: string }
      | string
      | null;
    schedule?: string;
    createdAt?: string;
  };
  createdAt?: string;
}

export interface ReferralsResponse {
  /** False when the calling user's role disqualifies them from earning
   *  referral commissions (admins, moderators — instructors are
   *  eligible). Treat missing as `true` so older API versions keep
   *  working. */
  eligible?: boolean;
  code?: string;
  uses?: number;
  qualifiedCount?: number;
  commissionRate?: number;
  totals: {
    pendingNaira: number;
    earnedNaira: number;
    paidNaira: number;
  };
  records: ReferralRecord[];
}

export interface AccountApplicationItem {
  kind: "course" | "internship" | "scholarship" | string;
  id: string;
  label: string;
  status: string;
  when?: string;
  awardedTier?: string;
}

export interface ApplicationsResponse {
  courses: AccountApplicationItem[];
  internships: AccountApplicationItem[];
  scholarships: AccountApplicationItem[];
}

export interface SetPasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

export type PayoutStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled";

export interface PayoutBankSnapshot {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface Payout {
  _id: string;
  kind: string;
  status: PayoutStatus;
  totalAmount: number;
  currency: string;
  bankSnapshot: PayoutBankSnapshot;
  commissions: string[];
  processedAt?: string;
  createdAt: string;
}

export interface PayoutsMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface PayoutsListResponse {
  items: Payout[];
  meta: PayoutsMeta;
}
