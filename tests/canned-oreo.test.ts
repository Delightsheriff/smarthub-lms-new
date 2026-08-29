import { describe, expect, it } from "vitest";
import {
  answerOreoQuestion,
  OREO_SUGGESTIONS,
  OREO_USAGE,
} from "@/lib/api/mock/oreo-canned";

describe("answerOreoQuestion", () => {
  it("resolves the seeded 'assignments due' question deterministically", () => {
    const answer = answerOreoQuestion("What assignments are due this week?");
    expect(answer.answer).toMatch(/^# Assignments due this week/);
    expect(answer.answer).toContain("| Assignment |");
    expect(answer.answer).toContain("- The cleaning script");
    expect(answer.toolsUsed).toContain("get_open_assignments");
    expect(answer.data.length).toBeGreaterThanOrEqual(2);
  });

  it("tags the canned table answer with its tool steps", () => {
    const answer = answerOreoQuestion("What is my balance?");
    expect(answer.data[0].tool).toBe("get_billing_summary");
    expect(answer.toolsUsed).toEqual(
      expect.arrayContaining(["get_billing_summary", "get_installment_plan"]),
    );
  });

  it("falls back to a generic answer for unknown questions", () => {
    const answer = answerOreoQuestion("tell me about quantum physics");
    expect(answer.answer).toMatch(/^# Here's what I found/);
    expect(answer.toolsUsed).toEqual(["classify_question"]);
  });

  it("always attaches the month usage summary", () => {
    const answer = answerOreoQuestion("anything");
    expect(answer.monthUsage).toEqual(OREO_USAGE);
  });

  it("never exposes HTML in the canned answer body", () => {
    const answer = answerOreoQuestion("What's my outstanding balance?");
    expect(answer.answer).not.toContain("<");
  });
});

describe("OREO_SUGGESTIONS", () => {
  it("covers both effective modes", () => {
    expect(Object.keys(OREO_SUGGESTIONS).sort()).toEqual([
      "instructor",
      "student",
    ]);
  });

  it("each seeded suggestion resolves a canned answer (not the fallback)", () => {
    for (const question of OREO_SUGGESTIONS.student) {
      expect(answerOreoQuestion(question).answer).not.toMatch(
        /^# Here's what I found/,
      );
    }
  });
});

describe("OREO_USAGE", () => {
  it("is near-but-not-at the ceiling (meter shows real tokens left)", () => {
    expect(OREO_USAGE.blocked).toBe(false);
    expect(OREO_USAGE.unlimited).toBe(false);
    expect(OREO_USAGE.tokensLeft).toBeGreaterThan(0);
    expect(OREO_USAGE.tokensUsed + OREO_USAGE.tokensLeft).toBe(
      OREO_USAGE.tokensLimit,
    );
  });
});