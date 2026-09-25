import { describe, expect, it } from "vitest";
import {
  daysInBirthMonth,
  formatBirthday,
  isValidBirthday,
} from "@/modules/profile/lib/birthday";

describe("birthday helpers", () => {
  it("formats day + month without a year", () => {
    expect(formatBirthday(17, 9)).toBe("17 September");
    expect(formatBirthday(29, 2)).toBe("29 February");
  });

  it("returns undefined when either half is missing or invalid", () => {
    expect(formatBirthday(undefined, 9)).toBeUndefined();
    expect(formatBirthday(17, undefined)).toBeUndefined();
    expect(formatBirthday(31, 4)).toBeUndefined();
  });

  it("mirrors the API's per-month day limits (Feb allows 29)", () => {
    expect(daysInBirthMonth(2)).toBe(29);
    expect(daysInBirthMonth(4)).toBe(30);
    expect(daysInBirthMonth(undefined)).toBe(31);
    expect(isValidBirthday(30, 2)).toBe(false);
    expect(isValidBirthday(31, 12)).toBe(true);
    expect(isValidBirthday(0, 1)).toBe(false);
    expect(isValidBirthday(1, 13)).toBe(false);
  });
});
