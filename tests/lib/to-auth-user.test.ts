import { describe, it, expect } from "vitest";
import { toAuthUser } from "@/lib/auth/to-auth-user";

describe("toAuthUser", () => {
  it("derives student role from roles array when lmsRole is omitted", () => {
    const user = toAuthUser({
      _id: "usr_1",
      email: "student@test.com",
      roles: ["student"],
    });
    expect(user.lmsRole).toBe("student");
    expect(user.referralEligible).toBe(true);
  });

  it("derives instructor role from roles array when lmsRole is omitted", () => {
    const user = toAuthUser({
      _id: "usr_2",
      email: "instructor@test.com",
      roles: ["instructor"],
    });
    expect(user.lmsRole).toBe("instructor");
  });

  it("derives both role when user has student and instructor roles", () => {
    const user = toAuthUser({
      _id: "usr_3",
      email: "dual@test.com",
      roles: ["student", "instructor"],
    });
    expect(user.lmsRole).toBe("both");
  });

  it("prioritizes the server's lmsRole over derived role", () => {
    const user = toAuthUser({
      _id: "usr_4",
      email: "server-role@test.com",
      roles: ["student"],
      lmsRole: "instructor",
    });
    expect(user.lmsRole).toBe("instructor");
  });

  it("honors server referralEligible value when false", () => {
    const user = toAuthUser({
      _id: "usr_5",
      email: "not-eligible@test.com",
      roles: ["student"],
      referralEligible: false,
    });
    expect(user.referralEligible).toBe(false);
  });

  it("honors server referralEligible value when true", () => {
    const user = toAuthUser({
      _id: "usr_6",
      email: "eligible@test.com",
      roles: ["student"],
      referralEligible: true,
    });
    expect(user.referralEligible).toBe(true);
  });
});
