/**
 * Registers the mock query/mutation handlers against the data-source
 * seam (`lib/api/client.ts`). Imported once at app boot. Each handler
 * returns the wire shape a module's normaliser expects — identical to
 * what the real API will return at Plan 012.
 */

import { registerMockRoute, type MockRequestContext } from "@/lib/api/client";
import type { WireMaterial, WireRecording } from "@/lib/api/wire.types";
import {
  mockAssignedModules,
  mockBanking,
  mockDatabase,
  mockProgressPulse,
  mockReferrals,
  mockUser,
} from "@/lib/api/mock/mockDatabase";

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
