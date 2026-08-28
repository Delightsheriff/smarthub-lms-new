/**
 * Registers the mock query/mutation handlers against the data-source
 * seam (`lib/api/client.ts`). Imported once at app boot. Each handler
 * returns the wire shape a module's normaliser expects — identical to
 * what the real API will return at Plan 012.
 */

import { registerMockRoute, type MockRequestContext } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import type { WireMaterial, WireRecording } from "@/lib/api/wire.types";
import {
  mockAssignedModules,
  mockBanking,
  mockDatabase,
  mockProgressPulse,
  mockReferrals,
  mockUser,
} from "@/lib/api/mock/mockDatabase";

const isoNow = () => new Date().toISOString();
const isoDaysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString();

/** Mutable store of referral payouts, seeded with a pending + paid row. */
const mockPayouts = [
  {
    _id: "payout_referral_1",
    kind: "referral",
    status: "pending",
    totalAmount: 75000,
    currency: "NGN",
    bankSnapshot: { bankName: "GTBank", accountName: "Oluwaseun Ade Balogun", accountNumber: "0123456789" },
    commissions: ["ref_1"],
    createdAt: isoDaysAgo(1),
  },
  {
    _id: "payout_referral_2",
    kind: "referral",
    status: "paid",
    totalAmount: 45000,
    currency: "NGN",
    bankSnapshot: { bankName: "GTBank", accountName: "Oluwaseun Ade Balogun", accountNumber: "0123456789" },
    commissions: ["ref_3"],
    createdAt: isoDaysAgo(30),
    processedAt: isoDaysAgo(24),
  },
];

const byId = <T extends { _id: string }>(items: T[], id?: string, arr: T[] = items) =>
  arr.find((i) => i._id === id);

registerMockRoute({
  verb: "get",
  path: "/auth/me",
  handler: () => mockDatabase.users[0],
});

registerMockRoute({
  verb: "get",
  path: "/lms/enrolled-courses",
  handler: () => mockDatabase.courses,
});

// Alias: courses service reads `/lms/courses`; enrolled-courses is the
// legacy spelling the calendar/nav surfaces still use.
registerMockRoute({
  verb: "get",
  path: "/lms/courses",
  handler: () => mockDatabase.courses,
});

/** Build a full course-detail payload: embeds each module's content
 *  (recordings/materials/assignments) + aggregated `resources` counts.
 *  Mirrors what `GET /lms/courses/:slug` returns so the outline and
 *  module page render off a single round-trip (no per-module fan-out). */
function buildCourseDetail(courseId: string) {
  const course = byId(mockDatabase.courses, courseId);
  if (!course) return null;
  const modules = course.modules
    .map((m) => mockDatabase.modules[m._id]?.[0])
    .filter(Boolean);
  const resources = modules.reduce(
    (acc, mod) => {
      acc.totalRecordings += mod?.recordings?.length ?? 0;
      acc.totalMaterials += mod?.materials?.length ?? 0;
      acc.totalAssignments += mod?.assignments?.length ?? 0;
      return acc;
    },
    { totalRecordings: 0, totalMaterials: 0, totalAssignments: 0 },
  );
  return { ...course, modules, resources };
}

registerMockRoute({
  verb: "get",
  path: "/lms/courses/:courseSlug",
  handler: (ctx: MockRequestContext) => {
    const slug = String(ctx.params?.courseSlug);
    const course = mockDatabase.courses.find((c) => c.nameSlug === slug);
    if (!course) throw new Error("course not found");
    return buildCourseDetail(course._id);
  },
});

/** Flat content feeds with course + module context attached — mirrors
 *  the enrolled-course walk the source does for `/recordings` and
 *  `/materials`. */
function contentFeed() {
  const out: {
    recordings: Array<{
      course: { _id: string; name: string; nameSlug: string };
      module: { _id: string; title: string; titleSlug?: string };
      recording: WireRecording;
    }>;
    materials: Array<{
      course: { _id: string; name: string; nameSlug: string };
      module: { _id: string; title: string; titleSlug?: string };
      material: WireMaterial;
    }>;
  } = { recordings: [], materials: [] };

  for (const course of mockDatabase.courses) {
    for (const modSummary of course.modules) {
      const mod = mockDatabase.modules[modSummary._id]?.[0];
      if (!mod) continue;
      const courseRef = {
        _id: course._id,
        name: course.name,
        nameSlug: course.nameSlug,
      };
      const moduleRef = {
        _id: mod._id,
        title: mod.title,
        titleSlug: mod.titleSlug,
      };
      for (const rec of mod.recordings ?? []) {
        out.recordings.push({ course: courseRef, module: moduleRef, recording: rec });
      }
      for (const mat of mod.materials ?? []) {
        out.materials.push({ course: courseRef, module: moduleRef, material: mat });
      }
    }
  }
  return out;
}

registerMockRoute({
  verb: "get",
  path: "/lms/recordings/me",
  handler: () => contentFeed().recordings,
});

registerMockRoute({
  verb: "get",
  path: "/lms/materials/me",
  handler: () => contentFeed().materials,
});

registerMockRoute({
  verb: "patch",
  path: "/lms/recordings/:id/view",
  handler: (ctx: MockRequestContext) => {
    const id = String(ctx.params?.id);
    for (const course of mockDatabase.courses) {
      for (const modSummary of course.modules) {
        const mod = mockDatabase.modules[modSummary._id]?.[0];
        const rec = (mod?.recordings ?? []).find((r) => r._id === id);
        if (rec) {
          rec.watched = true;
          return { success: true, watched: true };
        }
      }
    }
    throw new Error("recording not found");
  },
});

registerMockRoute({
  verb: "patch",
  path: "/lms/materials/:id/download",
  handler: () => ({ success: true }),
});

registerMockRoute({
  verb: "get",
  path: "/lms/enrolled-courses/:courseId",
  handler: (ctx: MockRequestContext) => {
    const course = byId(mockDatabase.courses, String(ctx.params?.courseId));
    const modules = course
      ? course.modules
          .map((m) => mockDatabase.modules[m._id]?.[0])
          .filter(Boolean)
      : [];
    const resources = course
      ? course.modules.reduce(
          (acc, m) => {
            const mod = mockDatabase.modules[m._id]?.[0];
            acc.totalRecordings += mod?.recordings?.length ?? 0;
            acc.totalMaterials += mod?.materials?.length ?? 0;
            acc.totalAssignments += mod?.assignments?.length ?? 0;
            return acc;
          },
          { totalRecordings: 0, totalMaterials: 0, totalAssignments: 0 },
        )
      : { totalRecordings: 0, totalMaterials: 0, totalAssignments: 0 };
    if (!course) throw new Error("course not found");
    return { ...course, modules, resources };
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/modules/:moduleSlug",
  handler: (ctx: MockRequestContext) => {
    const slug = String(ctx.params?.moduleSlug);
    const entry = Object.values(mockDatabase.modules).find(
      (arr) => arr[0]?.titleSlug === slug,
    );
    return entry?.[0] ?? null;
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/view/recordings",
  handler: () =>
    Object.values(mockDatabase.modules).flatMap((arr) =>
      (arr[0]?.recordings ?? []).map((r) => r),
    ),
});

registerMockRoute({
  verb: "get",
  path: "/lms/view/materials",
  handler: () =>
    Object.values(mockDatabase.modules).flatMap((arr) =>
      (arr[0]?.materials ?? []).map((m) => m),
    ),
});

registerMockRoute({
  verb: "get",
  path: "/lms/assignments",
  handler: () =>
    Object.values(mockDatabase.modules).flatMap((arr) =>
      (arr[0]?.assignments ?? []).map((a) => a),
    ),
});

registerMockRoute({
  verb: "get",
  path: "/lms/assignments/:assignmentId",
  handler: (ctx: MockRequestContext) => {
    for (const arr of Object.values(mockDatabase.modules)) {
      const a = byId(arr[0]?.assignments ?? [], String(ctx.params?.assignmentId));
      if (a) return a;
    }
    return null;
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/submissions/:assignmentId/mine",
  handler: (ctx: MockRequestContext) => {
    const assignmentId = String(ctx.params?.assignmentId);
    return mockDatabase.submissions.find(
      (s) => s.assignment === assignmentId && s.user === mockDatabase.users[0]._id,
    ) ?? null;
  },
});

registerMockRoute({
  verb: "post",
  path: "/lms/submissions",
  handler: (ctx: MockRequestContext) => {
    const data = ctx.data as { assignment: string } | undefined;
    if (!data) throw new Error("missing submission body");
    const existing = mockDatabase.submissions.find(
      (s) => s.assignment === data.assignment && s.user === mockDatabase.users[0]._id,
    );
    const updated = {
      _id: existing?._id ?? `sub_${data.assignment}_${mockDatabase.users[0]._id}`,
      assignment: data.assignment,
      user: mockDatabase.users[0]._id,
      submissionType: "file" as const,
      fileUrl: "https://mock.smarthub.dev/sub/upload.zip",
      fileName: "submission.zip",
      status: "submitted" as const,
      submittedAt: new Date().toISOString(),
      isLateSubmission: false,
      version: (existing?.version ?? 0) + 1,
      submissionHistory: [
        ...(existing?.submissionHistory ?? []),
        { action: "submitted", timestamp: new Date().toISOString() },
      ],
    };
    if (existing) {
      Object.assign(existing, updated);
    } else {
      mockDatabase.submissions.push(updated as never);
    }
    return updated;
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/calendar",
  handler: () => mockDatabase.calendar,
});

registerMockRoute({
  verb: "get",
  path: "/lms/activity",
  handler: () => [],
});

registerMockRoute({
  verb: "get",
  path: "/lms/webinars",
  handler: () => mockDatabase.webinars,
});

registerMockRoute({
  verb: "get",
  path: "/lms/conversations",
  handler: () => mockDatabase.conversations,
});

registerMockRoute({
  verb: "get",
  path: "/lms/conversations/:conversationId/messages",
  handler: (ctx: MockRequestContext) => {
    const conv = byId(mockDatabase.conversations, String(ctx.params?.conversationId));
    if (!conv?.lastMessage) return [];
    return [conv.lastMessage];
  },
});

registerMockRoute({
  verb: "post",
  path: "/lms/conversations/:conversationId/messages",
  handler: (ctx: MockRequestContext) => {
    const conv = byId(
      mockDatabase.conversations,
      String(ctx.params?.conversationId),
    );
    const content = (ctx.data as { content?: string } | undefined)?.content ?? "";
    const msg = {
      _id: `msg_${Date.now()}`,
      conversationId: String(ctx.params?.conversationId),
      sender: mockDatabase.users[0],
      content,
      createdAt: new Date().toISOString(),
    };
    if (conv) conv.lastMessage = msg as never;
    return msg;
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/notifications",
  handler: () => mockDatabase.notifications,
});

registerMockRoute({
  verb: "post",
  path: "/lms/notifications/:notificationId/read",
  handler: (ctx: MockRequestContext) => {
    const n = mockDatabase.notifications.find(
      (x) => x._id === String(ctx.params?.notificationId),
    );
    if (n) n.read = true;
    return { success: true };
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/billing/breakdown",
  handler: () => mockDatabase.billing,
});

registerMockRoute({
  verb: "get",
  path: "/lms/payments/summary",
  handler: () => ({
    totalPaid: 320000,
    totalDue: 480000,
    totalAmount: 800000,
    paymentProgress: 40,
    nextPaymentDue: {
      amount: 230000,
      dueDate: mockDatabase.billing.overall.nextPaymentDue,
      course: "Python for AI & Data",
    },
  }),
});

registerMockRoute({
  verb: "get",
  path: "/lms/account/me",
  handler: () => ({
    ...mockUser,
    referralCode: mockReferrals.code,
    hasPassword: true,
  }),
});

registerMockRoute({
  verb: "get",
  path: "/lms/account/referrals",
  handler: () => mockReferrals,
});

registerMockRoute({
  verb: "get",
  path: "/lms/account/banking",
  handler: () => mockBanking,
});

registerMockRoute({
  verb: "get",
  path: "/lms/modules/assigned",
  handler: () => mockAssignedModules,
});

registerMockRoute({
  verb: "get",
  path: "/lms/me/progress-pulse",
  handler: () => mockProgressPulse,
});

// Achievements + cohort pulse are intentionally empty in the mock phase —
// the ProgressPulseCard self-gates on their presence, so the personal
// pulse renders cleanly without badge/cohort sections.
registerMockRoute({
  verb: "get",
  path: "/lms/me/achievements",
  handler: () => [],
});

registerMockRoute({
  verb: "get",
  path: "/lms/me/cohort-pulse",
  handler: () => [],
});

registerMockRoute({
  verb: "get",
  path: "/lms/internships/me",
  handler: () => mockDatabase.internships[0] ?? null,
});

registerMockRoute({
  verb: "get",
  path: "/lms/scholarship-applications/me",
  handler: () => mockDatabase.scholarship[0] ?? null,
});

registerMockRoute({
  verb: "get",
  path: "/lms/teaching/cohorts",
  handler: () => mockDatabase.teaching,
});

registerMockRoute({
  verb: "get",
  path: "/lms/search",
  handler: () => [],
});

// ---------------------------------------------------------------
// Plan 009 — Profile, Payments & Billing, SIWES, Letters, Referrals
// ---------------------------------------------------------------

registerMockRoute({
  verb: "patch",
  path: "/lms/profile/details",
  handler: (ctx: MockRequestContext) => {
    const patch = (ctx.data ?? {}) as Record<string, unknown>;
    for (const key of Object.keys(patch)) {
      (mockUser as unknown as Record<string, unknown>)[key] = patch[key];
    }
    return { success: true, message: "Profile updated", statusCode: 200 };
  },
});

registerMockRoute({
  verb: "patch",
  path: "/lms/profile/professional",
  handler: (ctx: MockRequestContext) => {
    const patch = (ctx.data ?? {}) as Record<string, unknown>;
    for (const key of Object.keys(patch)) {
      (mockUser as unknown as Record<string, unknown>)[key] = patch[key];
    }
    return { success: true, message: "Professional profile saved", statusCode: 200 };
  },
});

registerMockRoute({
  verb: ["get", "patch"],
  path: "/lms/profile/banking",
  handler: (ctx: MockRequestContext) => {
    const stored = (mockUser as unknown as { _profileBanking?: Record<string, unknown> })
      ._profileBanking ?? {
      bankName: "GTBank",
      accountName: "Oluwaseun Ade Balogun",
      accountNumber: "0123456789",
      payoutEmail: "ade.balogun@example.com",
      updatedAt: isoDaysAgo(3),
    };
    if (ctx.path.endsWith("/banking") && ctx.path.includes("/profile/") === false) {
      /* noop guard */
    }
    if (typeof (ctx as { data?: unknown }).data === "object" && (ctx as { data?: unknown }).data !== null) {
      const patch = (ctx as { data: Record<string, unknown> }).data;
      const next = {
        ...stored,
        ...patch,
        updatedAt: isoNow(),
      };
      (mockUser as unknown as { _profileBanking?: Record<string, unknown> })._profileBanking = next;
      return next;
    }
    return stored;
  },
});

registerMockRoute({
  verb: "post",
  path: "/auth/set-password",
  handler: () => ({ success: true, message: "Password updated", statusCode: 200 }),
});

registerMockRoute({
  verb: "post",
  path: "/lms/me/attendance-pin/rotate",
  handler: () => ({
    rawPin: String(Math.floor(1000 + Math.random() * 9000)),
    issuedAt: isoNow(),
  }),
});

// Storage seam: "put bytes → get URL". Blob is discarded; the mock keeps
// an in-memory URL. Mirrors `downscaleImage`/`cloudinary-download` output.
const uploadUrls: string[] = [];
registerMockRoute({
  verb: "post",
  path: "/uploads",
  handler: () => {
    const url = `/uploads/${uploadUrls.length + 1}`;
    uploadUrls.push(url);
    return { url };
  },
});

registerMockRoute({
  verb: "get",
  path: "/payment-proofs/me",
  handler: () => ({
    bank: {
      bankName: "Guaranty Trust Bank",
      accountName: "SmartHub Academy",
      accountNumber: "0987654321",
      paymentInstructions: "Use your full name as the transfer narration so we can match your payment.",
    },
    registrations: mockDatabase.billing.registrations.map((r) => ({
      _id: r._id,
      courseName: r.course?.name || "Untitled course",
      totalAmount: r.totalAmount,
      paidAmount: r.paidAmount,
      remainingAmount: r.remainingAmount,
      paymentOption: r.paymentOption,
      paymentStatus: r.paymentStatus as string,
    })),
    proofs: mockDatabase.paymentProofs,
  }),
});

registerMockRoute({
  verb: "get",
  path: "/payment-proofs/my-plans",
  handler: () => mockDatabase.installmentPlans,
});

registerMockRoute({
  verb: "post",
  path: "/payment-proofs",
  handler: (ctx: MockRequestContext) => {
    const input = (ctx.data ?? {}) as {
      amount?: number;
      screenshotUrl?: string;
      registration?: string;
      installment?: string;
      reference?: string;
    };
    const proof = {
      _id: `pp_${Date.now()}`,
      purpose: "course",
      courseName: mockDatabase.billing.registrations.find(
        (r) => r._id === input.registration,
      )?.course?.name,
      amountClaimed: input.amount ?? 0,
      screenshotUrl: input.screenshotUrl ?? "",
      reference: input.reference,
      status: "pending",
      createdAt: isoNow(),
    };
    mockDatabase.paymentProofs.push(proof as (typeof mockDatabase.paymentProofs)[number]);
    return proof;
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/me/siwes-registrations",
  handler: () => mockDatabase.siwesRegistrations,
});

registerMockRoute({
  verb: "get",
  path: "/lms/acceptance-letters",
  handler: () => mockDatabase.acceptanceLetters,
});

registerMockRoute({
  verb: "patch",
  path: "/lms/registrations/:id/siwes-duration",
  handler: (ctx: MockRequestContext) => {
    const id = String(ctx.params?.id);
    const reg = mockDatabase.siwesRegistrations.find(
      (r) => r.registrationId === id,
    );
    if (!reg || reg.siwesDurationEditable === false) {
      throw new ApiError(
        "This registration is locked — contact admin to change the duration.",
        403,
      );
    }
    const body = (ctx.data ?? {}) as { siwesDurationMonths?: number };
    reg.siwesDurationMonths = body.siwesDurationMonths;
    return { success: true, message: "SIWES duration updated", statusCode: 200 };
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/instructor-earnings/me",
  handler: () => mockDatabase.instructorEarnings,
});

registerMockRoute({
  verb: "get",
  path: "/lms/instructor-earnings/breakdown",
  handler: () => mockDatabase.earningsBreakdown,
});

registerMockRoute({
  verb: "get",
  path: "/lms/account/applications",
  handler: () => ({
    courses: mockDatabase.billing.registrations.map((r) => ({
      kind: "course",
      id: r._id,
      label: r.course?.name || "Course",
      status: r.paymentStatus,
      when: r.schedule?.startDate,
    })),
    internships: mockDatabase.internships.map((i) => ({
      kind: "internship",
      id: i._id,
      label: i.product?.name || "Internship",
      status: i.status,
      when: i.startDate,
    })),
    scholarships: mockDatabase.scholarship.map((s) => ({
      kind: "scholarship",
      id: s._id,
      label: `Scholarship — ${s.cohort}`,
      status: s.stage,
      when: s.createdAt,
      awardedTier: s.awardedTier,
    })),
  }),
});

registerMockRoute({
  verb: "get",
  path: "/lms/referrals/payouts",
  handler: (ctx: MockRequestContext) => {
    const page = Number(ctx.params?.page) || 1;
    const pageSize = Number(ctx.params?.pageSize) || 20;
    const start = (page - 1) * pageSize;
    const items = mockPayouts.slice(start, start + pageSize);
    return {
      items,
      meta: {
        totalItems: mockPayouts.length,
        totalPages: Math.max(1, Math.ceil(mockPayouts.length / pageSize)),
        currentPage: page,
        pageSize,
      },
    };
  },
});

registerMockRoute({
  verb: "post",
  path: "/lms/referrals/payouts",
  handler: () => {
    const payout = {
      _id: `payout_referral_${Date.now()}`,
      kind: "referral",
      status: "pending",
      totalAmount: mockReferrals.totals.earnedNaira,
      currency: "NGN",
      bankSnapshot: mockBanking,
      commissions: [],
      createdAt: isoNow(),
    };
    mockPayouts.unshift(payout);
    // Requesting a payout moves the earned commission into the pending
    // payout so the ledger reflects it's no longer withdrawable.
    mockReferrals.totals.earnedNaira = 0;
    return payout;
  },
});

registerMockRoute({
  verb: "delete",
  path: "/lms/referrals/payouts/:id",
  handler: (ctx: MockRequestContext) => {
    const id = String(ctx.params?.id);
    const idx = mockPayouts.findIndex((p) => p._id === id);
    if (idx === -1) throw new ApiError("Payout not found", 404);
    const [removed] = mockPayouts.splice(idx, 1);
    if (removed?.status === "pending") {
      // Cancelling a pending payout returns its value to the earned
      // balance.
      mockReferrals.totals.earnedNaira += removed.totalAmount;
    }
    return { success: true, message: "Payout cancelled", statusCode: 200 };
  },
});

const CHECKED_IN_SESSIONS = new Set<string>();
registerMockRoute({
  verb: "post",
  path: "/lms/class-sessions/:sessionId/check-in",
  handler: (ctx: MockRequestContext) => {
    const sessionId = String(ctx.params?.sessionId);
    const body = (ctx.data ?? {}) as { token?: string };
    if (!body.token) throw new ApiError("Invalid or missing check-in token.", 401);
    if (sessionId === "expired-session") throw new ApiError("This QR has expired.", 410);
    if (sessionId === "foreign-session" || sessionId.startsWith("not-enrolled")) {
      throw new ApiError("You're not enrolled in this cohort.", 403);
    }
    if (CHECKED_IN_SESSIONS.has(sessionId)) {
      return { status: "already-checked-in" };
    }
    CHECKED_IN_SESSIONS.add(sessionId);
    return { status: "ok" };
  },
});
