import { describe, expect, it } from "vitest";
import { notificationTarget } from "@/modules/notifications/components/NotificationBell";

describe("notificationTarget", () => {
  it("routes in-app paths client-side", () => {
    expect(notificationTarget("/payments")).toEqual({ href: "/payments", external: false });
    expect(notificationTarget(" /assignments/abc?tab=brief ")).toEqual({
      href: "/assignments/abc?tab=brief",
      external: false,
    });
  });

  it("opens absolute http(s) links externally", () => {
    expect(notificationTarget("https://meet.example.com/x")).toEqual({
      href: "https://meet.example.com/x",
      external: true,
    });
  });

  it("drops empty, protocol-relative and non-http targets", () => {
    expect(notificationTarget(undefined)).toBeNull();
    expect(notificationTarget("  ")).toBeNull();
    expect(notificationTarget("//evil.example.com")).toBeNull();
    expect(notificationTarget("javascript:alert(1)")).toBeNull();
    expect(notificationTarget("payments")).toBeNull();
  });
});
