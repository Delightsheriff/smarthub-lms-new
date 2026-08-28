import { LMS_PREFIX } from "@/lib/api/constants";

/**
 * Endpoints for the `/account/*` surface — the same routes the
 * consumer client's "Refer & earn" dashboard reads. The LMS bearer
 * token is honoured by these handlers.
 */
export const REFERRALS_ENDPOINTS = {
  ME: `${LMS_PREFIX}/account/me`,
  REFERRALS: `${LMS_PREFIX}/account/referrals`,
  APPLICATIONS: `${LMS_PREFIX}/account/applications`,
  BANKING: `${LMS_PREFIX}/account/banking`,
  SET_PASSWORD: "/auth/set-password",
  PAYOUTS: `${LMS_PREFIX}/referrals/payouts`,
  PAYOUT_CANCEL: (id: string) => `${LMS_PREFIX}/referrals/payouts/${id}`,
} as const;
