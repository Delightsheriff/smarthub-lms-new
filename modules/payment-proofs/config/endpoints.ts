/**
 * Unified payment-proof endpoints. These live at the API root (NOT under
 * /lms) — the same routes serve the public account surface and the LMS
 * portal; they differ only by which bearer token is attached.
 */
export const PAYMENT_PROOFS_ENDPOINTS = {
  BASE: "/payment-proofs",
  MINE: "/payment-proofs/me",
  MY_PLANS: "/payment-proofs/my-plans",
} as const;
