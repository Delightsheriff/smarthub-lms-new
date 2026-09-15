/**
 * Instructor-facing self-paced shapes: referral links, the orders they
 * produced, and the revenue-share ledger. Mirrors smarthub-api's
 * `instructor-links.service` and `revenue-share.service` 1:1.
 *
 * Money is integer MINOR units in the row's own currency, and totals
 * come per currency. Nothing here is ever summed across currencies.
 */

export interface InstructorLinkStats {
  paidOrders: number;
  refundedOrders: number;
  /** Gross of paid (non-refunded) attributed orders, by currency. */
  grossMinorByCurrency: Record<string, number>;
}

export interface InstructorLink {
  _id: string;
  code: string;
  isActive: boolean;
  revokedAt?: string;
  createdAt?: string;
  /** Built by the API from its own CLIENT_URL. The LMS builds its own
   *  from the public-site origin and only falls back to this. */
  shareUrl?: string;
  course?: { _id: string; name?: string; slug?: string };
  stats: InstructorLinkStats;
}

/** A self-paced course the instructor is named on with no link yet. */
export interface CourseWithoutLink {
  _id: string;
  name: string;
  slug?: string;
  isPublished: boolean;
}

export interface MyInstructorLinks {
  links: InstructorLink[];
  coursesWithoutLink: CourseWithoutLink[];
}

export type AttributedOrderStatus = "paid" | "refunded";

export interface AttributedOrder {
  _id: string;
  reference: string;
  itemType: string;
  itemId: string;
  itemName: string;
  amountMinor: number;
  currency: string;
  status: AttributedOrderStatus | string;
  paidAt?: string;
  refundedAt?: string;
  referralCode?: string;
  /** Buyer identity is reduced to a first name by the API. */
  buyerFirstName: string;
}

/** `{ total, page, limit }` — these endpoints use the legacy meta names. */
export interface InstructorListMeta {
  total: number;
  page: number;
  limit: number;
}

export interface Paged<T> {
  data: T[];
  meta: InstructorListMeta;
}

// ─── Revenue share ────────────────────────────────────────────────────

export type SelfPacedShareStatus =
  | "accrued"
  | "not-eligible"
  | "clawed-back"
  | "clawback-review";

export interface ShareConfig {
  /** Basis points: 4000 = 40%. */
  instructorReferralBps: number;
  ownChannelBps: number;
  defaultWindowMonths: number;
}

export interface EarningsTotals {
  currency: string;
  /** Owed on live sales, whether or not bundled into a payout yet. */
  accruedMinor: number;
  /** Of accrued: turned into payout pay items by an admin. */
  materialisedMinor: number;
  /** Of materialised: pay item paid. */
  paidOutMinor: number;
  clawedBackMinor: number;
  /** Refunded after payout — an admin settles it by hand. */
  clawbackReviewMinor: number;
  accruedCount: number;
  notEligibleCount: number;
}

export interface EarningsCourseRow {
  course: {
    _id: string;
    name?: string;
    slug?: string;
    isTripwire: boolean;
    revenueShareMonths?: number;
    firstPublishedAt?: string;
  };
  totalsByCurrency: EarningsTotals[];
}

/**
 * Where a share's money stands, derived by the API from its pay item:
 *  - not-materialised  accrued, not yet a pay item
 *  - pending           pay item waiting to be bundled into a payout
 *  - processing        in a payout that hasn't been paid
 *  - paid              paid out
 *  - cancelled         pay item cancelled (e.g. refunded before payout)
 */
export type SharePayoutState =
  | "not-materialised"
  | "pending"
  | "processing"
  | "paid"
  | "cancelled";

export interface SelfPacedShareRow {
  /** Absent from an API that predates it — fall back to `materialisedAt`. */
  payoutState?: SharePayoutState | string;
  _id: string;
  orderReference: string;
  /** Populated by the API (`name nameSlug`); a bare id if the course is gone. */
  course?: { _id: string; name?: string; nameSlug?: string } | string | null;
  currency: string;
  saleSource: string;
  netMinor: number;
  rateBps: number;
  shareMinor: number;
  windowMonths?: number;
  windowEndsAt?: string;
  paidAt?: string;
  status: SelfPacedShareStatus | string;
  reason?: string;
  materialisedAt?: string;
  clawedBackAt?: string;
  clawbackReason?: string;
  createdAt?: string;
}

export interface MySelfPacedEarnings {
  config?: ShareConfig;
  totalsByCurrency: EarningsTotals[];
  courses: EarningsCourseRow[];
  recentShares: SelfPacedShareRow[];
}
