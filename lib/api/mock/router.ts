/**
 * Registers the mock query/mutation handlers against the data-source
 * seam (`lib/api/client.ts`). Imported once at app boot. Each handler
 * returns the wire shape a module's normaliser expects — identical to
 * what the real API will return at Plan 012.
 */

import { registerMockRoute, type MockRequestContext } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import type { WireMaterial, WireRecording, WireSubmission } from "@/lib/api/wire.types";
import {
  mockAssignedModules,
  mockBanking,
  mockBranding,
  mockDatabase,
  mockHelpResources,
  mockInternshipPayment,
  mockProgressPulse,
  mockReferrals,
  mockUser,
} from "@/lib/api/mock/mockDatabase";
import {
  answerOreoQuestion,
  OREO_USAGE,
} from "@/lib/api/mock/oreo-canned";

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
  path: "/lms/submissions/student",
  handler: () =>
    mockDatabase.submissions.filter(
      (s) => s.user === mockDatabase.users[0]._id,
    ),
});

registerMockRoute({
  verb: "get",
  path: "/lms/submissions/:assignmentId/mine",
  handler: (ctx: MockRequestContext) => {
    const assignmentId = String(ctx.params?.assignmentId);
    return (
      mockDatabase.submissions.find(
        (s) => s.assignment === assignmentId && s.user === mockDatabase.users[0]._id,
      ) ?? null
    );
  },
});

registerMockRoute({
  verb: "post",
  path: "/lms/submissions",
  handler: (ctx: MockRequestContext) => {
    const data = ctx.data as {
      assignmentId?: string;
      assignment?: string;
      submissionType?: "file" | "text" | "url";
      content?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      fileMimeType?: string;
      externalUrl?: string;
      notes?: string;
    } | undefined;

    if (!data) throw new Error("missing submission body");
    const targetAssignmentId = data.assignmentId || data.assignment;
    if (!targetAssignmentId) throw new Error("missing assignment ID");

    const existingIndex = mockDatabase.submissions.findIndex(
      (s) => s.assignment === targetAssignmentId && s.user === mockDatabase.users[0]._id,
    );
    const existing = existingIndex >= 0 ? mockDatabase.submissions[existingIndex] : null;

    const newVersion = (existing?.version ?? 0) + 1;
    const now = new Date().toISOString();

    const newSubmission: WireSubmission = {
      _id: existing?._id ?? `sub_${targetAssignmentId}_${mockDatabase.users[0]._id}`,
      assignment: targetAssignmentId,
      user: mockDatabase.users[0]._id,
      submissionType: data.submissionType ?? "file",
      content: data.content,
      fileUrl: data.fileUrl ?? (data.submissionType === "file" ? "https://mock.smarthub.dev/sub/upload.pdf" : undefined),
      fileName: data.fileName ?? (data.submissionType === "file" ? "submission.pdf" : undefined),
      fileSize: data.fileSize ?? 102400,
      fileMimeType: data.fileMimeType ?? "application/pdf",
      externalUrl: data.externalUrl,
      notes: data.notes,
      status: "submitted",
      submittedAt: now,
      isLateSubmission: false,
      version: newVersion,
      previousVersionId: existing?._id,
      submissionHistory: [
        ...(existing?.submissionHistory ?? []),
        { action: "submitted", timestamp: now, notes: data.notes || "Submitted work" },
      ],
    };

    if (existingIndex >= 0) {
      mockDatabase.submissions[existingIndex] = newSubmission;
    } else {
      mockDatabase.submissions.push(newSubmission);
    }
    return newSubmission;
  },
});

registerMockRoute({
  verb: "put",
  path: "/lms/submissions/:id/resubmit",
  handler: (ctx: MockRequestContext) => {
    const subId = String(ctx.params?.id);
    const data = ctx.data as {
      submissionType?: "file" | "text" | "url";
      content?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      fileMimeType?: string;
      externalUrl?: string;
      notes?: string;
    } | undefined;

    const existingIndex = mockDatabase.submissions.findIndex((s) => s._id === subId);
    if (existingIndex < 0) {
      throw new Error(`Submission ${subId} not found`);
    }

    const existing = mockDatabase.submissions[existingIndex];
    const now = new Date().toISOString();
    const newVersion = existing.version + 1;

    const updated: WireSubmission = {
      ...existing,
      submissionType: data?.submissionType ?? existing.submissionType,
      content: data?.content ?? existing.content,
      fileUrl: data?.fileUrl ?? existing.fileUrl,
      fileName: data?.fileName ?? existing.fileName,
      fileSize: data?.fileSize ?? existing.fileSize,
      fileMimeType: data?.fileMimeType ?? existing.fileMimeType,
      externalUrl: data?.externalUrl ?? existing.externalUrl,
      notes: data?.notes ?? existing.notes,
      status: "resubmitted",
      submittedAt: now,
      version: newVersion,
      previousVersionId: existing._id,
      submissionHistory: [
        ...(existing.submissionHistory ?? []),
        { action: "resubmitted", timestamp: now, notes: data?.notes || `Resubmitted v${newVersion}` },
      ],
    };

    mockDatabase.submissions[existingIndex] = updated;
    return updated;
  },
});

registerMockRoute({
  verb: "post",
  path: "/lms/uploads/assignment",
  handler: () => ({
    url: "https://mock.smarthub.dev/uploads/assignment-file.pdf",
    fileName: "assignment-file.pdf",
    fileSize: 245000,
    mimeType: "application/pdf",
  }),
});

registerMockRoute({
  verb: "get",
  path: "/lms/calendar",
  handler: (ctx: MockRequestContext) => {
    const fromStr = typeof ctx.params?.from === "string" ? ctx.params.from : undefined;
    const toStr = typeof ctx.params?.to === "string" ? ctx.params.to : undefined;

    let events = mockDatabase.calendar;

    if (fromStr && toStr) {
      const from = new Date(fromStr).getTime();
      const to = new Date(toStr).getTime();
      events = events.filter((e) => {
        const t = new Date(e.start).getTime();
        return t >= from && t <= to;
      });
    }

    return events;
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/activity",
  handler: (ctx: MockRequestContext) => {
    const page = parseInt(String(ctx.params?.page || "1"), 10) || 1;
    const pageSize = parseInt(String(ctx.params?.pageSize || "20"), 10) || 20;

    const data = mockDatabase.activity || [];
    const total = data.length;
    const totalPages = Math.ceil(total / pageSize) || 1;

    const start = (page - 1) * pageSize;
    const pagedData = data.slice(start, start + pageSize);

    return {
      statusCode: 200,
      message: "Activity history fetched successfully",
      success: true,
      data: pagedData,
      meta: {
        total,
        totalPages,
        currentPage: page,
        pageSize,
      },
    };
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/webinars",
  handler: (ctx: MockRequestContext) => {
    const sort = ctx.params?.sort;
    const page = parseInt(String(ctx.params?.page || "1"), 10) || 1;
    const pageSize = parseInt(String(ctx.params?.pageSize || "10"), 10) || 10;
    const now = Date.now();

    let all = mockDatabase.webinars || [];

    if (sort === "upcoming") {
      all = all.filter((w) => new Date(w.date).getTime() >= now - 3600 * 2 * 1000);
      return all;
    }

    if (sort === "past") {
      all = all.filter((w) => new Date(w.date).getTime() < now - 3600 * 2 * 1000);
    }

    const total = all.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const paged = all.slice(start, start + pageSize);

    return {
      statusCode: 200,
      message: "Webinars fetched successfully",
      success: true,
      data: paged,
      meta: {
        total,
        totalPages,
        currentPage: page,
        pageSize,
      },
    };
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/conversations",
  handler: () => mockDatabase.conversations || [],
});

registerMockRoute({
  verb: "get",
  path: "/lms/conversations/:conversationId/messages",
  handler: (ctx: MockRequestContext) => {
    const convId = String(ctx.params?.conversationId);
    const msgs = (mockDatabase.messages || []).filter((m) => m.conversationId === convId);

    if (msgs.length > 0) return msgs;

    const conv = byId(mockDatabase.conversations, convId);
    if (conv?.lastMessage) return [conv.lastMessage];
    return [];
  },
});

registerMockRoute({
  verb: "post",
  path: "/lms/conversations/:conversationId/messages",
  handler: (ctx: MockRequestContext) => {
    const convId = String(ctx.params?.conversationId);
    const conv = byId(mockDatabase.conversations, convId);
    const data = ctx.data as { content?: string; type?: "text" | "file" | "audio" | "video" | "system" } | undefined;
    const content = data?.content ?? "";

    const msg = {
      _id: `msg_${Date.now()}`,
      conversationId: convId,
      sender: mockDatabase.users[0],
      content,
      type: data?.type || "text",
      createdAt: new Date().toISOString(),
    };

    if (!mockDatabase.messages) mockDatabase.messages = [];
    mockDatabase.messages.push(msg);

    if (conv) {
      conv.lastMessage = msg;
      conv.updatedAt = msg.createdAt;
    }

    return msg;
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/notifications",
  handler: () => mockDatabase.notifications || [],
});

registerMockRoute({
  verb: "get",
  path: "/lms/notifications/unread-count",
  handler: () => {
    const count = (mockDatabase.notifications || []).filter((n) => !n.read && !n.isRead).length;
    return { count };
  },
});

registerMockRoute({
  verb: "post",
  path: "/lms/notifications/:notificationId/read",
  handler: (ctx: MockRequestContext) => {
    const n = mockDatabase.notifications.find(
      (x) => x._id === String(ctx.params?.notificationId),
    );
    if (n) {
      n.read = true;
      n.isRead = true;
    }
    return { success: true };
  },
});

registerMockRoute({
  verb: "put",
  path: "/lms/notifications/:notificationId/read",
  handler: (ctx: MockRequestContext) => {
    const n = mockDatabase.notifications.find(
      (x) => x._id === String(ctx.params?.notificationId),
    );
    if (n) {
      n.read = true;
      n.isRead = true;
    }
    return { success: true };
  },
});

registerMockRoute({
  verb: "post",
  path: "/lms/notifications/mark-all-read",
  handler: () => {
    (mockDatabase.notifications || []).forEach((n) => {
      n.read = true;
      n.isRead = true;
    });
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
  handler: () => mockDatabase.teaching || [],
});

registerMockRoute({
  verb: "get",
  path: "/lms/teaching/cohorts/:id",
  handler: (ctx: MockRequestContext) => {
    const id = String(ctx.params?.id);
    const cohort = byId(mockDatabase.teaching, id);
    if (!cohort) return null;

    const courseModules = mockDatabase.modules[cohort.course?._id || "course_1"] || [];

    return {
      ...cohort,
      instructors: [
        { _id: "usr_2", firstName: "Ngozi", lastName: "Okonkwo" },
      ],
      modules: courseModules.map((m, idx) => ({
        _id: m._id,
        title: m.title,
        titleSlug: m.titleSlug,
        description: m.description,
        learningObjectives: m.learningObjectives,
        estimatedDuration: m.estimatedDuration,
        order: idx + 1,
        assignmentCount: 2,
        recordingCount: 3,
        materialCount: 5,
      })),
    };
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/teaching/cohorts/:id/roster",
  handler: (ctx: MockRequestContext) => {
    const id = String(ctx.params?.id);
    return mockDatabase.teachingRosters[id] || mockDatabase.teachingRosters["sched_1"] || [];
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/teaching/cohorts/:id/assignments",
  handler: (ctx: MockRequestContext) => {
    const id = String(ctx.params?.id);
    return mockDatabase.teachingAssignments[id] || mockDatabase.teachingAssignments["sched_1"] || [];
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/teaching/cohorts/:id/submissions",
  handler: (ctx: MockRequestContext) => {
    const id = String(ctx.params?.id);
    return mockDatabase.teachingSubmissions[id] || mockDatabase.teachingSubmissions["sched_1"] || [];
  },
});

registerMockRoute({
  verb: "put",
  path: "/lms/teaching/submissions/:id/grade",
  handler: (ctx: MockRequestContext) => {
    const subId = String(ctx.params?.id);
    const data = ctx.data as { score?: number; feedback?: string } | undefined;

    for (const scheduleId of Object.keys(mockDatabase.teachingSubmissions)) {
      const subs = mockDatabase.teachingSubmissions[scheduleId];
      const target = subs.find((s) => s.id === subId);
      if (target) {
        target.status = "graded";
        target.score = data?.score;
        return { success: true, submission: target };
      }
    }

    return { success: true };
  },
});

registerMockRoute({
  verb: "put",
  path: "/lms/teaching/assignments/:attachmentId",
  handler: (ctx: MockRequestContext) => {
    const attId = String(ctx.params?.attachmentId);
    const data = ctx.data as { dueDate?: string; isVisible?: boolean } | undefined;

    for (const scheduleId of Object.keys(mockDatabase.teachingAssignments)) {
      const atts = mockDatabase.teachingAssignments[scheduleId];
      const target = atts.find((a) => a.attachmentId === attId);
      if (target) {
        if (data?.dueDate !== undefined) target.dueDate = data.dueDate;
        if (data?.isVisible !== undefined) target.isVisible = data.isVisible;
        return { success: true, attachment: target };
      }
    }

    return { success: true };
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/teaching/attendance/sessions/:id",
  handler: (ctx: MockRequestContext) => {
    const sessionId = String(ctx.params?.id);
    const sessionData = mockDatabase.teachingSessions[sessionId] || mockDatabase.teachingSessions["cs_1"];
    return sessionData;
  },
});

registerMockRoute({
  verb: "post",
  path: "/lms/teaching/attendance/sessions/:id/mark",
  handler: (ctx: MockRequestContext) => {
    const sessionId = String(ctx.params?.id);
    const data = ctx.data as { marks?: Array<{ studentId: string; status: "present" | "late" | "absent" | "excused"; note?: string }> } | undefined;
    const sessionData = mockDatabase.teachingSessions[sessionId] || mockDatabase.teachingSessions["cs_1"];

    if (sessionData && data?.marks) {
      for (const mark of data.marks) {
        const row = sessionData.rows.find((r) => r.studentId === mark.studentId);
        if (row) {
          row.status = mark.status;
          row.source = "instructor";
          row.note = mark.note;
          row.markedAt = new Date().toISOString();
        }
      }
    }

    return { succeeded: data?.marks?.length || 0, failed: 0 };
  },
});

registerMockRoute({
  verb: "get",
  path: "/lms/teaching/attendance/students/:studentId",
  handler: (ctx: MockRequestContext) => {
    const studentId = String(ctx.params?.studentId);
    return {
      student: { userId: studentId, firstName: "Ade", lastName: "Balogun", email: "ade.balogun@example.com" },
      cohorts: [
        {
          scheduleId: "sched_1",
          courseName: "Full-Stack Web Development",
          cohortStartDate: daysAgo(30),
          summary: { held: 10, present: 8, late: 1, absent: 1, excused: 0, unmarked: 0, percentage: 85 },
          sessions: [
            {
              sessionId: "cs_1",
              title: "Live: Flexbox Lab",
              startsAt: daysAgo(0),
              isCancelled: false,
              status: "present",
              source: "instructor",
              durationMinutes: 110,
              markedAt: daysAgo(0),
            },
          ],
        },
      ],
    };
  },
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

/** Internship — `GET /lms/internships/me`. Null when the user has no
 *  placement (grads / non-interns), which self-gates the workspace. */
registerMockRoute({
  verb: "get",
  path: "/lms/internships/me",
  handler: () => mockDatabase.internships[0] ?? null,
});

/** Internship tasks — `PATCH /lms/internships/me/tasks/:taskId`. Students
 *  can only reach `in_progress`/`submitted` (never set `done`, never
 *  un-set a status). */
registerMockRoute({
  verb: "patch",
  path: "/lms/internships/me/tasks/:taskId",
  handler: (ctx: MockRequestContext) => {
    const internship = mockDatabase.internships[0];
    if (!internship) throw new ApiError("No internship placement", 404);
    const taskId = String(ctx.params?.taskId);
    const task = internship.tasks?.find((t) => t._id === taskId);
    if (!task) throw new ApiError("Task not found", 404);
    const body = (ctx.data ?? {}) as {
      status?: string;
      submissionUrl?: string;
      submissionNote?: string;
    };
    const nextStatus = body.status;
    if (
      nextStatus &&
      !["in_progress", "submitted"].includes(nextStatus)
    ) {
      throw new ApiError("You can only start or submit a task.", 403);
    }
    if (nextStatus) task.status = nextStatus as typeof task.status;
    if (nextStatus === "submitted") {
      task.submissionUrl = body.submissionUrl?.trim() || undefined;
      task.submissionNote = body.submissionNote?.trim() || undefined;
      task.submittedAt = isoNow();
    }
    return internship;
  },
});

/** Internship check-ins — `POST /lms/internships/me/check-ins`. */
registerMockRoute({
  verb: "post",
  path: "/lms/internships/me/check-ins",
  handler: (ctx: MockRequestContext) => {
    const internship = mockDatabase.internships[0];
    if (!internship) throw new ApiError("No internship placement", 404);
    const body = (ctx.data ?? {}) as {
      weekOf?: string;
      summary?: string;
      blockers?: string;
      hoursLogged?: number;
    };
    if (!body.weekOf || !body.summary?.trim()) {
      throw new ApiError("Week and summary are required.", 400);
    }
    const checkIn = {
      _id: `ci_${internship.checkIns.length + 1}`,
      weekOf: body.weekOf,
      summary: body.summary.trim(),
      blockers: body.blockers?.trim() || undefined,
      hoursLogged: body.hoursLogged,
      submittedAt: isoNow(),
    };
    internship.checkIns.push(checkIn);
    return checkIn;
  },
});

/** Internship payment — `GET /lms/internships/me/payment`. Null for
 *  grads/waived/non-interns; settled fixture proves the confirmed strip. */
registerMockRoute({
  verb: "get",
  path: "/lms/internships/me/payment",
  handler: () => mockInternshipPayment ?? null,
});

/** Internship payment proof — `POST /lms/internships/me/payment-proof`.
 *  The receipt was already uploaded to `/uploads` (storage seam); this
 *  just records it + the optional reference. */
registerMockRoute({
  verb: "post",
  path: "/lms/internships/me/payment-proof",
  handler: (ctx: MockRequestContext) => {
    const body = (ctx.data ?? {}) as {
      proofUrl?: string;
      reference?: string;
    };
    if (!body.proofUrl) throw new ApiError("Missing proof URL.", 400);
    Object.assign(mockInternshipPayment, {
      paymentProofUrl: body.proofUrl,
      paymentReference: body.reference?.trim() || undefined,
      paymentProofSubmittedAt: isoNow(),
    });
    return mockInternshipPayment;
  },
});

/** Scholarship — `GET /scholarship-applications/me`. Returns the active
 *  (admitted/enrolled) application or null so the card render-nothings. */
registerMockRoute({
  verb: "get",
  path: "/scholarship-applications/me",
  handler: () =>
    mockDatabase.scholarship.find(
      (a) => a.stage === "admitted" || a.stage === "enrolled",
    ) ?? null,
});

/** Banner regeneration timestamp — bumped when `?force=true`. */
let regeneratedAt = isoNow();

/** Scholarship banner — `GET /scholarship-applications/me/banner`.
 *  `?force=true` regenerates (bumps generatedAt). */
registerMockRoute({
  verb: "get",
  path: "/scholarship-applications/me/banner",
  handler: (ctx: MockRequestContext) => {
    const force = String(ctx.params?.force) === "true";
    if (force) regeneratedAt = isoNow();
    return {
      squareUrl: "/mock/banner-square.png",
      wideUrl: "/mock/banner-wide.png",
      generatedAt: regeneratedAt,
      suggestedCaption:
        "I got the SmartHub Tech Scholarship 🎓 — full ride into the Web Development track. Couldn't have asked for a better start. #SmartHub #TechScholarship #WebDev",
    };
  },
});

/** Scholarship photo — `PATCH /scholarship-applications/me/photo`.
 *  Upload-persist only (no crop) in this slice — the URL comes from the
 *  `/uploads` storage seam. Mirrors the photo onto the auth user so the
 *  banner has a face to work with. */
registerMockRoute({
  verb: "patch",
  path: "/scholarship-applications/me/photo",
  handler: (ctx: MockRequestContext) => {
    const body = (ctx.data ?? {}) as { imageUrl?: string };
    if (!body.imageUrl) throw new ApiError("Missing image URL.", 400);
    mockUser.imageUrl = body.imageUrl;
    return { ok: true };
  },
});

/** Oreo — canned ask + stream. Both resolve the same deterministic
 *  `AskAnswer` after a short delay so streaming states render. The page
 *  consumes the promise directly; the real SSE `streamAsk` reader is the
 *  deferred adapter for Plan 012. */
const oreoDelay = () => new Promise((r) => setTimeout(r, 650));
registerMockRoute({
  verb: "post",
  path: "/lms/oreo/ask",
  handler: async (ctx: MockRequestContext) => {
    await oreoDelay();
    const body = (ctx.data ?? {}) as { question?: string };
    return answerOreoQuestion(String(body.question ?? ""));
  },
});
registerMockRoute({
  verb: "post",
  path: "/lms/oreo/ask/stream",
  handler: async (ctx: MockRequestContext) => {
    await oreoDelay();
    const body = (ctx.data ?? {}) as { question?: string };
    return answerOreoQuestion(String(body.question ?? ""));
  },
});

/** Oreo usage — `GET /lms/oreo/usage`. */
registerMockRoute({
  verb: "get",
  path: "/lms/oreo/usage",
  handler: () => OREO_USAGE,
});

/** Help library — `GET /lms/help?mode=…`. Filtered by audience; the
 *  server pre-sorts by category then order. */
registerMockRoute({
  verb: "get",
  path: "/lms/help",
  handler: (ctx: MockRequestContext) => {
    const mode = String(ctx.params?.mode ?? "student");
    return mockHelpResources
      .filter(
        (r) => r.audience === "all" || r.audience === mode,
      )
      .sort(
        (a, b) =>
          a.category.localeCompare(b.category) || a.order - b.order,
      );
  },
});

/** Branding — `GET /platform/branding` (public, not under /lms). */
registerMockRoute({
  verb: "get",
  path: "/platform/branding",
  handler: () => mockBranding,
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
