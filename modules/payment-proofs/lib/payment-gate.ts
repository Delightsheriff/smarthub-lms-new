import type { MyInstallmentPlanUi } from "../types";

/**
 * Routes a suspended learner can still reach. The API allows more than
 * this (notifications, profile, auth), but these are the ones that
 * actually help someone get unstuck.
 */
export const PAYMENT_GATE_ALWAYS_OPEN = [
  "/payments",
  "/billing",
  "/profile",
  "/help",
  "/inbox",
];

export const SUSPENDED_ACCESS = "suspended_payment";

export type PaymentGateDecision =
  | { kind: "open" }
  | { kind: "blocked"; plan: MyInstallmentPlanUi };

/**
 * Pure decision for the payment paywall — testable without the client
 * hook/DOM. Returns `blocked` only when the learner has a suspended
 * plan AND no other plan with open access AND they're not on one of
 * the `ALWAYS_OPEN` routes that still helps them get unstuck.
 *
 * `plans === undefined` (loading/error) reads as open — never flash a
 * paywall while the request is still in flight.
 */
export function resolvePaymentGate(
  plans: MyInstallmentPlanUi[] | undefined,
  pathname: string | null,
): PaymentGateDecision {
  if (!plans) return { kind: "open" };

  const suspended = plans.find((p) => p.accessStatus === SUSPENDED_ACCESS);
  if (!suspended) return { kind: "open" };

  // A learner with any non-suspended plan still has somewhere to be.
  const hasOpenAccess = plans.some(
    (p) => p.accessStatus !== SUSPENDED_ACCESS,
  );
  if (hasOpenAccess) return { kind: "open" };

  // Path-boundary aware: `/payments` and `/payments/proof` count, but
  // `/payments-archived` doesn't — a naive `startsWith` would treat any
  // prefix junk as the open surface.
  if (
    PAYMENT_GATE_ALWAYS_OPEN.some((open) => {
      const area = `${open}/`;
      return pathname === open || pathname?.startsWith(area);
    })
  ) {
    return { kind: "open" };
  }

  return { kind: "blocked", plan: suspended };
}