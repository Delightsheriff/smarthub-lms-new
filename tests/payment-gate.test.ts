import { describe, expect, it } from "vitest";
import {
  resolvePaymentGate,
  SUSPENDED_ACCESS,
} from "@/modules/payment-proofs/lib/payment-gate";
import type { MyInstallmentPlanUi } from "@/modules/payment-proofs/types";

const activePlan: MyInstallmentPlanUi = {
  id: "plan_1",
  enrollmentId: "reg_1",
  courseName: "Python for AI & Data",
  origin: "course",
  planType: "installment",
  status: "active",
  totalAmount: 350000,
  paidAmount: 120000,
  amountDue: 230000,
  accessStatus: "active",
  installments: [],
};

const suspendedPlan: MyInstallmentPlanUi = {
  ...activePlan,
  id: "plan_suspended",
  accessStatus: SUSPENDED_ACCESS,
};

describe("resolvePaymentGate", () => {
  it("opens when plans are still loading (undefined)", () => {
    expect(resolvePaymentGate(undefined, "/")).toMatchObject({ kind: "open" });
  });

  it("opens when there are no plans at all", () => {
    expect(resolvePaymentGate([], "/")).toMatchObject({ kind: "open" });
  });

  it("opens when no plan is suspended", () => {
    expect(resolvePaymentGate([activePlan], "/dashboard")).toMatchObject({
      kind: "open",
    });
  });

  it("blocks when every plan is suspended and the route is locked", () => {
    const d = resolvePaymentGate([suspendedPlan], "/dashboard");
    expect(d.kind).toBe("blocked");
    if (d.kind === "blocked") expect(d.plan.accessStatus).toBe(SUSPENDED_ACCESS);
  });

  it("opens when any plan still has open access", () => {
    const d = resolvePaymentGate([suspendedPlan, activePlan], "/dashboard");
    expect(d.kind).toBe("open");
  });

  it("opens on the always-open routes even when fully suspended", () => {
    expect(resolvePaymentGate([suspendedPlan], "/payments")).toMatchObject({
      kind: "open",
    });
    expect(resolvePaymentGate([suspendedPlan], "/profile")).toMatchObject({
      kind: "open",
    });
    expect(resolvePaymentGate([suspendedPlan], "/help")).toMatchObject({
      kind: "open",
    });
  });

  it("still blocks on a locked route that merely starts with an open prefix", () => {
    // "/payments-suspended-history" is NOT the /payments surface.
    const d = resolvePaymentGate([suspendedPlan], "/payments-archived");
    expect(d.kind).toBe("blocked");
  });
});