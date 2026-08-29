import { describe, expect, it } from "vitest";
import {
  normaliseBreakdown,
  normaliseRegistration,
} from "@/modules/billing/api/normalise";
import type { ApiBillingRegistration } from "@/modules/billing/types/api.types";

const baseReg: ApiBillingRegistration = {
  _id: "reg_1",
  course: { name: "Full-Stack Web Development", mode: "hybrid" },
  schedule: { startDate: "2026-08-01", duration: "6 months" },
  paymentStatus: "pending",
  paymentOption: "installment",
  totalAmount: 350000,
  paidAmount: 120000,
  remainingAmount: 230000,
  coursePrice: 350000,
  nextPaymentDue: "2026-09-01",
  payments: [{ _id: "tr_1", amount: 120000, paymentDate: "2026-07-01" }],
};

describe("normaliseRegistration", () => {
  it("formats the cohort label from startDate + duration", () => {
    const r = normaliseRegistration(baseReg);
    expect(r.cohortLabel).toMatch(/1 Aug 2026 cohort · 6 months/);
  });

  it("falls back to duration alone when startDate is invalid", () => {
    const r = normaliseRegistration({
      ...baseReg,
      schedule: { startDate: "not-a-date", duration: "3 months" },
    });
    expect(r.cohortLabel).toBe("3 months");
  });

  it("falls back to 'Cohort' when both date and duration are absent", () => {
    const r = normaliseRegistration({
      ...baseReg,
      schedule: null,
    });
    expect(r.cohortLabel).toBe("Cohort");
  });

  it("clamps payment progress to 100 and floors below-zero at 0", () => {
    const over = normaliseRegistration({
      ...baseReg,
      paidAmount: 400000,
      totalAmount: 350000,
    });
    const under = normaliseRegistration({
      ...baseReg,
      paidAmount: -500,
      totalAmount: 350000,
    });
    expect(over.paymentProgress).toBe(100);
    expect(under.paymentProgress).toBe(0);
  });

  it("defaults to 0 progress when total is missing", () => {
    const r = normaliseRegistration({
      ...baseReg,
      totalAmount: 0,
      paidAmount: 100,
    });
    expect(r.paymentProgress).toBe(0);
  });

  it("passes discount presence through and never defaults to 0", () => {
    const discounted = normaliseRegistration({
      ...baseReg,
      coursePrice: 500000,
      totalAmount: 400000,
      discountAmount: 100000,
      discountKind: "percent",
      discountValue: 20,
      discountReason: "referral",
      discountNote: "Friend referral",
    });
    const plain = normaliseRegistration(baseReg);

    expect(discounted.discountAmount).toBe(100000);
    expect(discounted.discountKind).toBe("percent");
    expect(discounted.discountReason).toBe("referral");
    expect(discounted.discountNote).toBe("Friend referral");

    // The discount-presence contract: absent fields stay undefined,
    // NOT coerced to 0 — `discountAmount > 0` is the UI toggle.
    expect(plain.discountAmount).toBeUndefined();
    expect(plain.discountKind).toBeUndefined();
    expect(plain.discountValue).toBeUndefined();
  });

  it("surfaces nextPaymentDue as the raw due date string", () => {
    const r = normaliseRegistration(baseReg);
    expect(r.nextPaymentDue).toBe("2026-09-01");
  });
});

describe("normaliseBreakdown", () => {
  it("builds a full breakdown from complete wire data", () => {
    const b = normaliseBreakdown({
      overall: {
        totalPaid: 120000,
        totalDue: 230000,
        totalAmount: 350000,
        totalDiscount: 0,
        paymentProgress: 34,
      },
      registrations: [baseReg],
    });
    expect(b.registrations).toHaveLength(1);
    expect(b.registrations[0].id).toBe("reg_1");
    expect(b.overall.totalPaid).toBe(120000);
  });

  it("tolerates an empty registrations list", () => {
    const b = normaliseBreakdown({
      overall: {
        totalPaid: 0,
        totalDue: 0,
        totalAmount: 0,
        paymentProgress: 0,
      },
      registrations: [],
    });
    expect(b.overall.totalAmount).toBe(0);
    expect(b.overall.nextPaymentDue).toBeNull();
    expect(b.registrations).toHaveLength(0);
  });
});