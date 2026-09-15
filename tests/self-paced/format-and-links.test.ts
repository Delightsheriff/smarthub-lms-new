import { describe, expect, it } from "vitest";
import { formatBps, formatDuration, formatMinor, looksLikeHtml } from "@/modules/self-paced/lib/format";
import { nudgeHref } from "@/modules/self-paced/lib/nudge-link";
import { referralShareUrl } from "@/modules/self-paced/lib/share-link";
import type { InstructorLink } from "@/modules/self-paced/types/instructor.types";

describe("format helpers", () => {
  it("formats seconds into human readable duration", () => {
    expect(formatDuration(0)).toBe("");
    expect(formatDuration(45)).toBe("45 sec");
    expect(formatDuration(120)).toBe("2 min");
    expect(formatDuration(3600)).toBe("1 hr");
    expect(formatDuration(3900)).toBe("1 hr 5 min");
  });

  it("formats integer minor units as currency", () => {
    expect(formatMinor(undefined)).toBe("—");
    expect(formatMinor(1250000, "NGN")).toContain("12,500");
    expect(formatMinor(2550, "USD")).toContain("25.50");
  });

  it("formats basis points to percentage", () => {
    expect(formatBps(undefined)).toBe("—");
    expect(formatBps(4000)).toBe("40%");
    expect(formatBps(1250)).toBe("12.5%");
    expect(formatBps(1500)).toBe("15%");
  });

  it("detects HTML strings", () => {
    expect(looksLikeHtml("<p>Hello</p>")).toBe(true);
    expect(looksLikeHtml("Plain text")).toBe(false);
  });
});

describe("nudgeHref", () => {
  it("passes valid in-app /learn routes through unchanged", () => {
    expect(nudgeHref("/learn/python", "python")).toBe("/learn/python");
    expect(nudgeHref("/learn/python/lessons/123", "python")).toBe("/learn/python/lessons/123");
  });

  it("converts legacy /self-paced routes with lesson query to lesson route", () => {
    const legacyUrl = "/self-paced/react-native?lesson=60c72b2f9b1d8b2bad9a8888";
    expect(nudgeHref(legacyUrl, "react-native")).toBe(
      "/learn/react-native/lessons/60c72b2f9b1d8b2bad9a8888"
    );
  });

  it("falls back to course route when no lesson query is provided", () => {
    expect(nudgeHref("/self-paced/react-native", "react-native")).toBe("/learn/react-native");
    expect(nudgeHref(undefined, "devops")).toBe("/learn/devops");
  });
});

describe("referralShareUrl", () => {
  it("constructs public site referral URL with encoded course and code", () => {
    const link: InstructorLink = {
      _id: "link_1",
      code: "JANE40",
      isActive: true,
      course: { _id: "c_1", name: "Python", slug: "python-masterclass" },
      stats: { paidOrders: 0, refundedOrders: 0, grossMinorByCurrency: {} },
    };

    const url = referralShareUrl(link);
    expect(url).toContain("/courses/python-masterclass?ref=JANE40");
  });

  it("falls back to shareUrl if course has no slug", () => {
    const link: InstructorLink = {
      _id: "link_2",
      code: "NO_SLUG",
      isActive: true,
      shareUrl: "https://smart-hub.academy/legacy?ref=NO_SLUG",
      stats: { paidOrders: 0, refundedOrders: 0, grossMinorByCurrency: {} },
    };

    expect(referralShareUrl(link)).toBe("https://smart-hub.academy/legacy?ref=NO_SLUG");
  });
});
