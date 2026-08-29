/**
 * Canned Oreo mock — the mock-phase "AI". Pure, exported, dependency-free
 * (types only) so `tests/canned-oreo.test.ts` can unit-test the exact
 * conversation handling: a preseeded suggestion question → a deterministic
 * `AskAnswer` with tool steps + usage; anything else → a canned fallback.
 *
 * No OpenAI/SSE transport. The mock resolves after a short delay (in the
 * router handler) so the page's streaming states render.
 */

import type {
  AskAnswer,
  AskStep,
  AskUsageSummary,
} from "@/modules/oreo/types";

/** Usage near the token ceiling so the meter shows a real "left" bar. */
export const OREO_USAGE: AskUsageSummary = {
  tokensUsed: 184_200,
  tokensLimit: 200_000,
  tokensLeft: 15_800,
  unlimited: false,
  blocked: false,
  monthStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
};

/** Question substrings → the deterministic answer we seed in the UI. */
const CANNED_TABLE: Array<{ match: RegExp; answer: string; steps: AskStep[] }> = [
  {
    match: /due this week|assignments? due/i,
    answer: `# Assignments due this week\n\nHere's what's on your plate before Sunday:\n\n| Assignment | Course | Due |\n| --- | --- | --- |\n| Build a data-cleaning script | Python for AI & Data | ${new Date(Date.now() + 4 * 86_400_000).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} |\n| Weekly check-in | Internship | ${new Date(Date.now() + 2 * 86_400_000).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} |\n\nThings to note:\n\n- The cleaning script is the biggest chunk — leave yourself a couple of hours.\n- Keep your check-in summaries short; your mentor reads them before class.`,
    steps: [
      {
        tool: "get_open_assignments",
        args: { scope: "this-week" },
        result: { ok: true, data: { count: 2, dueSoonest: "weekly-check-in" } },
      },
      {
        tool: "get_enrolled_courses",
        args: {},
        result: { ok: true, data: { count: 2 } },
      },
    ],
  },
  {
    match: /balance|outstanding|fee|payment/i,
    answer: `# Your balance\n\nYou're in good shape on most of it. Here's the summary:\n\n* **Total paid this term:** ₦620,000\n* **Still due:** ₦230,000\n* **Next payment:** ₦115,000 — Payment 2, due as the schedule shows.\n\nYour Full-Stack registration is paid in full, so the remaining balance is the Python installment. If the due date is tight, clear it before the grace window closes to keep access running.`,
    steps: [
      {
        tool: "get_billing_summary",
        args: {},
        result: { ok: true, data: { totalPaid: 620000, totalDue: 230000 } },
      },
      {
        tool: "get_installment_plan",
        args: { first: true },
        result: { ok: true, data: { plan: "python-ai", amountDue: 115000 } },
      },
    ],
  },
  {
    match: /attendance|present|missed/i,
    answer: `# Attendance\n\nYour attendance is looking healthy — you've been marked present in **6 of 7** sessions this month. The single miss was excused.\n\nKeep it up: two missed, unexcused sessions in a row flag your record for review.`,
    steps: [
      {
        tool: "get_attendance_summary",
        args: { month: "this" },
        result: { ok: true, data: { present: 6, total: 7, excused: 1 } },
      },
    ],
  },
  {
    match: /next class|schedule|timetable/i,
    answer: `# Next class\n\nYour next session is **Full-Stack Web Development — live**, on the date shown in your calendar. It runs for 3 hours and the join link is posted on the classroom page.\n\nAfter that, you have a Python lab and a Webinars session before the week wraps.`,
    steps: [
      {
        tool: "get_next_session",
        args: {},
        result: { ok: true, data: { course: "full-stack-web", durationMinutes: 180 } },
      },
      {
        tool: "get_week_calendar",
        args: {},
        result: { ok: true, data: { sessions: 3 } },
      },
    ],
  },
];

const FALLBACK_ANSWER = `# Here's what I found\n\nI couldn't pull a specific answer for that one, but here's the shape of it:\n\n* Your courses, assignments, fees, attendance and schedule are all things I can read.\n* Questions outside that range get a general answer like this.\n\nIf you're asking about something specific, try rephrasing with a course or date in it — **e.g. "what's due this week?"** — and I'll dig in.`;

const FALLBACK_STEPS: AskStep[] = [
  {
    tool: "classify_question",
    args: {},
    result: { ok: true, data: { intent: "general", confidence: 0.41 } },
  },
];

const toolsFor = (steps: AskStep[]): string[] =>
  Array.from(new Set(steps.map((s) => s.tool)));

/** Deterministic canned answer for a question string. */
export function answerOreoQuestion(question: string): AskAnswer {
  const hit = CANNED_TABLE.find((row) => row.match.test(question));
  const steps = hit ? hit.steps : FALLBACK_STEPS;
  const answer = hit ? hit.answer : FALLBACK_ANSWER;
  return {
    answer,
    data: steps,
    toolsUsed: toolsFor(steps),
    monthUsage: OREO_USAGE,
  };
}

/** Get the seeded suggestion questions so the page and tests share one
 *  source of truth for what "preseeded" means. */
export const OREO_SUGGESTIONS = {
  student: [
    "What assignments are due this week?",
    "What's my outstanding balance?",
    "How's my attendance?",
    "When is my next class?",
  ],
  instructor: [
    "Which of my students haven't submitted?",
    "Who's in my cohorts?",
    "What do I need to grade?",
  ],
} as const;

export type OreoSuggestionMode = keyof typeof OREO_SUGGESTIONS;