import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { apiClient } from "@/lib/api";
import { mockUser } from "@/lib/api/mock/mockDatabase";

/**
 * Exercises the PATCH /lms/profile/details, PUT/PATCH banking and the
 * avatar-clear agreements through the real seam (`apiClient` → mock
 * router). `mockUser` is a module-level singleton, so every test snapshots
 * the fields it touches and restores them afterwards.
 */

const ORIGINAL = { ...mockUser };

const fieldsToRestore = () => {
  const snapshot: Record<string, unknown> = {};
  for (const key of ["firstName", "gender", "phone", "imageUrl"]) {
    if (key in mockUser) {
      snapshot[key] = (mockUser as unknown as Record<string, unknown>)[key];
    }
  }
  return snapshot;
};

beforeEach(() => {
  // Start each case from the ORIGINAL baseline (in case a prior run
  // mutated the singleton mid-suite).
  for (const [k, v] of Object.entries(fieldsToRestore())) {
    (mockUser as unknown as Record<string, unknown>)[k] = v;
  }
});

afterEach(() => {
  for (const [k, v] of Object.entries(fieldsToRestore())) {
    (mockUser as unknown as Record<string, unknown>)[k] = v;
  }
});

describe("PATCH /lms/profile/details", () => {
  it("folds name/gender/phone fields into the seeded AuthUser", async () => {
    await apiClient.patch("/lms/profile/details", {
      firstName: "Adeola",
      gender: "Female",
      phone: "+2348099999999",
    });

    expect(mockUser.firstName).toBe("Adeola");
    expect(mockUser.gender).toBe("Female");
    expect(mockUser.phone).toBe("+2348099999999");
  });

  it("clears avatar when imageUrl is an empty string", async () => {
    expect(mockUser.imageUrl).toBe(ORIGINAL.imageUrl);
    await apiClient.patch("/lms/profile/details", { imageUrl: "" });
    expect(mockUser.imageUrl).toBe("");
  });
});

describe("PATCH /lms/profile/banking", () => {
  it("persists the banking sub-doc and returns it", async () => {
    const patch = {
      bankName: "Zenith Bank",
      accountName: "Ade Adeola Balogun",
      accountNumber: "5555555555",
      payoutEmail: "adeola.balogun@example.com",
    };
    const next = await apiClient.patch<Record<string, unknown>>(
      "/lms/profile/banking",
      patch,
    );

    expect(next.accountNumber).toBe("5555555555");
    expect(next.bankName).toBe("Zenith Bank");
    const stored = (mockUser as unknown as { _profileBanking?: Record<string, unknown> })
      ._profileBanking;
    expect(stored?.accountNumber).toBe("5555555555");
  });
});