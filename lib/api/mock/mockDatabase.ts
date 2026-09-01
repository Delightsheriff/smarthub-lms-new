/**
 * UI-first mock data source.
 *
 * Holds **wire-shaped** records (string `_id`s, nested sub-docs, real enum
 * values — see `lib/api/wire.types.ts`) mirroring `smarthub-api`. The
 * data-source adapter (`lib/api/client.ts`) exposes async query/mutation
 * handlers over these records. When the real API lands (Plan 012), only
 * that adapter changes — this module becomes a test fixture / non-default
 * source.
 */

import type {
  WireAcceptanceLetterFixture,
  WireActivityEvent,
  WireAssignment,
  WireBillingBreakdown,
  WireCalendarEvent,
  WireConversation,
  WireEnrolledCourse,
  WireHelpResource,
  WireInstallmentPlanFixture,
  WireInternship,
  WireInternshipPayment,
  WireModule,
  WireNotification,
  WirePaymentProofFixture,
  WireRecording,
  WireScholarshipApplication,
  WireSiwesRegistrationFixture,
  WireSubmission,
  WireTeachingCohort,
  WireWebinar,
  WireUser,
} from "@/lib/api/wire.types";
import type { ApiAssignedModule } from "@/modules/assigned-modules/types/api.types";
import type { ProgressSnapshot } from "@/modules/progress/types";
import type { ReferralsResponse } from "@/modules/referrals/types";

const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString();
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString();

export const mockUser: WireUser = {
  _id: "usr_1",
  firstName: "Ade",
  middleName: "Oluwaseun",
  lastName: "Balogun",
  email: "ade.balogun@example.com",
  phone: "+2348012345678",
  imageUrl: "/mock/ade.jpg",
  roles: ["student", "instructor", "intern"],
  isVerified: true,
  gender: "Male",
  country: { isoCode: "NG", name: "Nigeria" },
  state: { isoCode: "LA", name: "Lagos" },
  city: "Ikeja",
  address: "12 Academy Road, Ikeja",
  createdAt: daysAgo(200),
  isITStudent: true,
  itVerificationStatus: "approved",
  siwesYear: 2026,
  institution: "University of Lagos",
  department: "Computer Science",
  studentCode: "UNILAG/CS/2024/0012",
  jobTitle: "Frontend Developer Intern",
  bio: "Full-stack web developer in training. I build accessible, fast interfaces and love learning new tools.",
  altPhone: "+2348098765432",
  timeZone: "Africa/Lagos",
};

export const mockInstructor: WireUser = {
  _id: "usr_2",
  firstName: "Ngozi",
  lastName: "Okonkwo",
  email: "ngozi.okonkwo@example.com",
  imageUrl: "/mock/ngozi.jpg",
  roles: ["instructor"],
  isVerified: true,
  gender: "Female",
  country: { isoCode: "NG", name: "Nigeria" },
  state: { isoCode: "FC", name: "FCT" },
  city: "Abuja",
  createdAt: daysAgo(500),
  jobTitle: "Lead Instructor",
  bio: "Data and AI educator with a decade of industry experience.",
  timeZone: "Africa/Lagos",
};

/**
 * A second student proving the photo gate fires for students without a
 * photo. `gender` and `imageUrl` are intentionally missing.
 */
export const mockStudentNoPhoto: WireUser = {
  _id: "usr_3",
  firstName: "Fatima",
  lastName: "Yusuf",
  email: "fatima.yusuf@example.com",
  phone: "+2348033334444",
  roles: ["student"],
  isVerified: true,
  createdAt: daysAgo(40),
};

/** Root set of wire-shaped records, keyed by collection. */
export interface MockDatabase {
  users: WireUser[];
  courses: WireEnrolledCourse[];
  modules: Record<string, WireModule[]>;
  recordings: WireRecording[];
  submissions: WireSubmission[];
  conversations: WireConversation[];
  calendar: WireCalendarEvent[];
  activity: WireActivityEvent[];
  notifications: WireNotification[];
  billing: WireBillingBreakdown;
  webinars: WireWebinar[];
  internships: WireInternship[];
  scholarship: WireScholarshipApplication[];
  teaching: WireTeachingCohort[];
  paymentProofs: WirePaymentProofFixture[];
  installmentPlans: WireInstallmentPlanFixture[];
  siwesRegistrations: WireSiwesRegistrationFixture[];
  acceptanceLetters: WireAcceptanceLetterFixture[];
  instructorEarnings: {
    totals: { pendingNaira: number; processingNaira: number; paidNaira: number };
    byKind?: { baseNaira: number; variableNaira: number; bonusNaira: number };
    cohorts: Array<{
      scheduleId?: string;
      course: string;
      stream?: string;
      startDate?: string;
      endDate?: string;
      pending: number;
      paid: number;
    }>;
    payouts: Array<{
      _id: string;
      totalAmount: number;
      status: string;
      createdAt?: string;
      processedAt?: string;
      bankName?: string;
    }>;
  };
  earningsBreakdown: Array<{
    scheduleId: string;
    course: string;
    model: string;
    isFlat: boolean;
    effectiveSharePct: number;
    yourEntitlementNaira: number;
    totalRevenueNaira: number;
    students: Array<{
      name: string;
      email?: string;
      paidNaira: number;
      yourCutNaira?: number;
    }>;
  }>;
}

export const mockDatabase: MockDatabase = {
  users: [mockUser, mockInstructor, mockStudentNoPhoto],

  courses: [
    {
      _id: "course_1",
      name: "Full-Stack Web Development",
      nameSlug: "full-stack-web-development",
      description:
        "Build and ship production web apps end-to-end: HTML/CSS, JavaScript, React, Node and databases, topped with a portfolio capstone.",
      thumbnail: "/mock/course-web.png",
      category: "Web Development",
      difficulty: "Intermediate",
      enrollment: {
        _id: "enr_1",
        enrollmentDate: daysAgo(40),
        status: "active",
        progress: 46,
        lastAccessedAt: daysAgo(1),
        schedule: {
          _id: "sched_1",
          startDate: daysAgo(30),
          endDate: daysFromNow(120),
          mode: "online",
          instructors: [wireInstructorRef()],
        },
      },
      modules: [
        { _id: "mod_1", title: "HTML & CSS Foundations", titleSlug: "html-css", order: 1, isPublished: true },
        { _id: "mod_2", title: "JavaScript Essentials", titleSlug: "js-essentials", order: 2, isPublished: true },
        { _id: "mod_3", title: "React & Components", titleSlug: "react-components", order: 3, isPublished: true },
      ],
      instructor: wireInstructorRef(),
      instructors: [wireInstructorRef()],
      moduleStats: { total: 3, completed: 1 },
      mode: "online",
      courseKind: "full",
    },
    {
      _id: "course_2",
      name: "Python for AI & Data",
      nameSlug: "python-for-ai-data",
      description:
        "From Python fundamentals to machine-learning basics and data analysis with pandas and scikit-learn.",
      thumbnail: "/mock/course-python.png",
      category: "Data Science",
      difficulty: "Beginner",
      enrollment: {
        _id: "enr_2",
        enrollmentDate: daysAgo(10),
        status: "active",
        progress: 12,
        lastAccessedAt: daysAgo(2),
        schedule: {
          _id: "sched_2",
          startDate: daysAgo(8),
          endDate: daysFromNow(160),
          mode: "hybrid",
          instructors: [wireInstructorRef()],
        },
      },
      modules: [
        { _id: "mod_4", title: "Python Basics", titleSlug: "python-basics", order: 1, isPublished: true },
        // Deliberately no titleSlug — exercises the slug→id fallback path
        // in `useCourseModule` / `normaliseModuleContent` (slug falls back
        // to `_id`). Route stays `/courses/.../modules/mod_6`.
        { _id: "mod_6", title: "NumPy & Vectorization", order: 2, isPublished: true },
      ],
      instructor: wireInstructorRef(),
      instructors: [wireInstructorRef()],
      moduleStats: { total: 2, completed: 0 },
      mode: "hybrid",
      courseKind: "full",
    },
    {
      _id: "course_3",
      name: "UI/UX Design Foundations",
      nameSlug: "ui-ux-design",
      description:
        "Design thinking, wireframing, and Figma. A completed course — exercises the completed-enrollment status mapping on the courses list.",
      thumbnail: "/mock/course-ux.png",
      category: "Design",
      difficulty: "Beginner",
      enrollment: {
        _id: "enr_3",
        enrollmentDate: daysAgo(90),
        status: "completed",
        progress: 100,
        lastAccessedAt: daysAgo(30),
        schedule: {
          _id: "sched_3",
          startDate: daysAgo(88),
          endDate: daysAgo(5),
          mode: "online",
          instructors: [wireInstructorRef()],
        },
      },
      modules: [
        { _id: "mod_7", title: "Design Thinking", titleSlug: "design-thinking", order: 1, isPublished: true },
        { _id: "mod_8", title: "Wireframes in Figma", titleSlug: "wireframes-figma", order: 2, isPublished: true },
      ],
      instructor: wireInstructorRef(),
      instructors: [wireInstructorRef()],
      moduleStats: { total: 2, completed: 2 },
      mode: "online",
      courseKind: "full",
    },
  ],

  modules: {
    mod_1: [
      {
        _id: "mod_1",
        title: "HTML & CSS Foundations",
        titleSlug: "html-css",
        description: "Semantic markup, flexbox, grid and responsive design.",
        status: "published",
        order: 1,
        estimatedDuration: 240,
        learningObjectives: [
          "Write semantic, accessible HTML",
          "Lay out pages with flexbox and grid",
          "Build responsive, mobile-first interfaces",
        ],
        cohortStatus: "completed",
        cohortStartedAt: daysAgo(30),
        cohortCompletedAt: daysAgo(14),
        recordings: [
          recording("rec_1", "Intro to HTML", 18, true, "published", {
            provider: "youtube",
            description: "<p>The first lesson on semantic markup.</p>",
          }),
          recording("rec_2", "Flexbox in Practice", 26, false, "published", {
            provider: "vimeo",
          }),
          recording("rec_3", "CSS Grid Masterclass", 31, false, "published", {
            parts: 2,
          }),
          recording("rec_4", "Responsive Deep Dive", 24, false, "published", {
            provider: "drive",
            locked: true,
          }),
        ],
        materials: [
          material("mat_1", "HTML & CSS Cheat Sheet", "guide", "pdf", {
            cloudinary: true,
            description:
              "<p>Printable cheat sheet covering tags, attributes and layout helpers.</p>",
          }),
          material("mat_2", "Week 1 Slides", "presentation", "slide", {
            multi: true,
          }),
          material("mat_3", "Practice Exercises", "exercise", "exercise", {
            guideOnly: true,
            description:
              "<p>Work through the four exercises in order, then compare against the walkthrough.</p>",
          }),
        ],
        assignments: [
          assignment("asgn_1", "Build a Landing Page", "mod_1", 100, 5, {
            status: "graded",
          }),
        ],
      },
    ],
    mod_2: [
      {
        _id: "mod_2",
        title: "JavaScript Essentials",
        titleSlug: "js-essentials",
        description: "Variables, functions, arrays, objects and DOM.",
        status: "published",
        order: 2,
        estimatedDuration: 300,
        learningObjectives: [
          "Master ES6+ syntax",
          "Work with the DOM and events",
        ],
        cohortStatus: "in-progress",
        cohortStartedAt: daysAgo(12),
        cohortCompletedAt: null,
        recordings: [
          recording("rec_4", "JavaScript Primer", 22, true, "published", {
            provider: "video",
          }),
          recording("rec_5", "DOM & Events", 27, false, "published"),
        ],
        materials: [
          material("mat_4", "ES6 Reference", "reference", "pdf", {
            drive: true,
          }),
        ],
        assignments: [
          assignment("asgn_2", "Interactive Quiz App", "mod_2", 80, 2),
        ],
      },
    ],
    mod_3: [
      {
        _id: "mod_3",
        title: "React & Components",
        titleSlug: "react-components",
        description: "Components, props, state and hooks.",
        status: "published",
        order: 3,
        estimatedDuration: 360,
        learningObjectives: ["Compose reusable components", "Manage state with hooks"],
        cohortStatus: "not-started",
        cohortStartedAt: null,
        cohortCompletedAt: null,
        recordings: [
          recording("rec_6", "Your First Component", 20, false, "published"),
        ],
        materials: [],
        assignments: [
          assignment("asgn_3", "Portfolio in React", "mod_3", 120, -1, {
            status: "overdue",
            priority: "high",
          }),
        ],
      },
    ],
    mod_4: [
      {
        _id: "mod_4",
        title: "Python Basics",
        titleSlug: "python-basics",
        description: "Syntax, data types, control flow and functions.",
        status: "published",
        order: 1,
        estimatedDuration: 180,
        learningObjectives: ["Read and write Python", "Use data structures"],
        cohortStatus: "in-progress",
        cohortStartedAt: daysAgo(8),
        cohortCompletedAt: null,
        recordings: [
          recording("rec_7", "Python Setup & First Script", 14, true, "published"),
        ],
        materials: [
          material("mat_5", "Python Quickstart", "guide", "pdf"),
        ],
        assignments: [
          assignment("asgn_4", "Data Wrangling Warm-up", "mod_4", 60, 7, {
            status: "draft",
            course: "course_2",
          }),
          assignment("asgn_5", "Pandas Primer", "mod_4", 80, 3, {
            status: "submitted",
            course: "course_2",
            priority: "high",
          }),
        ],
      },
    ],
    mod_6: [
      {
        _id: "mod_6",
        title: "NumPy & Vectorization",
        // No titleSlug — the course list entry mirrors this, so the
        // slug falls back to `_id` when building module routes.
        description:
          "Vectorised array computing with NumPy — the backbone of pandas.",
        status: "published",
        order: 2,
        estimatedDuration: 160,
        learningObjectives: ["Build ndarrays", "Vectorise loops"],
        cohortStatus: "not-started",
        cohortStartedAt: null,
        cohortCompletedAt: null,
        recordings: [
          recording("rec_8", "Arrays & Broadcasting", 21, false, "published", {
            description:
              "<p>How <strong>broadcasting</strong> keeps loops out of hot code.</p>",
          }),
        ],
        materials: [
          material("mat_6", "NumPy Cheat Sheet", "reference", "pdf", {
            cloudinary: true,
          }),
        ],
        assignments: [],
      },
    ],
    mod_7: [
      {
        _id: "mod_7",
        title: "Design Thinking",
        titleSlug: "design-thinking",
        description: "Empathise, define, ideate — the double diamond.",
        status: "published",
        order: 1,
        estimatedDuration: 200,
        learningObjectives: [
          "Run a discovery interview",
          "Frame a problem statement",
        ],
        cohortStatus: "completed",
        cohortStartedAt: daysAgo(70),
        cohortCompletedAt: daysAgo(30),
        recordings: [
          recording("rec_9", "The Double Diamond", 16, true, "published"),
        ],
        materials: [
          material("mat_7", "Double Diamond Canvas", "exercise", "pdf", {
            guideOnly: true,
            description:
              "<p>Fill the canvas for your own mini-product, then share to the cohort channel.</p>",
          }),
        ],
        assignments: [],
      },
    ],
    mod_8: [
      {
        _id: "mod_8",
        title: "Wireframes in Figma",
        titleSlug: "wireframes-figma",
        description: "From low-fidelity sketch to a Figma wireframe.",
        status: "published",
        order: 2,
        estimatedDuration: 190,
        learningObjectives: ["Use Figma frames", "Apply a grid"],
        cohortStatus: "completed",
        cohortStartedAt: daysAgo(30),
        cohortCompletedAt: daysAgo(6),
        recordings: [],
        materials: [
          material("mat_8", "Figma Starter File", "presentation", "slide", {
            drive: true,
          }),
        ],
        assignments: [],
      },
    ],
  },

  recordings: [],

  submissions: [
    submissionFor("asgn_1", "usr_1", {
      status: "graded",
      version: 2,
      submittedAt: daysAgo(3),
      grade: {
        score: 84,
        totalPoints: 100,
        percentage: 84,
        letterGrade: "B",
        rubricScores: [
          { criterion: "Layout & Grid Structure", score: 25, totalPoints: 30, comment: "Solid grid alignment." },
          { criterion: "Responsive Behavior", score: 29, totalPoints: 30, comment: "Clean transition across viewports." },
          { criterion: "Code Quality & Semantics", score: 30, totalPoints: 40, comment: "Accessible HTML and clean CSS." },
        ],
      },
      feedback: { general: "Great structure; tighten spacing on mobile header elements." },
      gradedAt: daysAgo(1),
      gradedBy: "Ngozi Okonkwo",
      submissionHistory: [
        { action: "submitted", timestamp: daysAgo(5), notes: "Initial landing page draft" },
        { action: "resubmitted", timestamp: daysAgo(3), notes: "Updated mobile layout spacing" },
        { action: "graded", timestamp: daysAgo(1), notes: "Graded by instructor" },
      ],
    }),
    submissionFor("asgn_2", "usr_1", {
      status: "submitted",
      version: 1,
      submissionType: "url",
      externalUrl: "https://github.com/ade/interactive-quiz-app",
      notes: "Submitted GitHub repository for Quiz App.",
      submittedAt: daysAgo(1),
      submissionHistory: [
        { action: "submitted", timestamp: daysAgo(1), notes: "Submitted repository link" },
      ],
    }),
  ],

  conversations: [
    {
      _id: "conv_1",
      type: "support",
      participants: [mockUser, mockInstructor],
      lastMessage: {
        _id: "msg_5",
        conversationId: "conv_1",
        sender: { _id: "usr_2", firstName: "Ngozi", lastName: "Okonkwo", email: "ngozi.okonkwo@example.com" },
        content: "Ready to review your latest submission, Ade.",
        createdAt: daysAgo(1),
      },
      unreadCount: { usr_1: 1 },
      updatedAt: daysAgo(1),
      metadata: {},
    },
    {
      _id: "conv_2",
      type: "assignment",
      participants: [mockUser, mockInstructor],
      lastMessage: {
        _id: "msg_9",
        conversationId: "conv_2",
        sender: { _id: "usr_1", firstName: "Ade", lastName: "Balogun", email: mockUser.email },
        content: "Just pushed my quiz app repo.",
        createdAt: daysAgo(2),
      },
      unreadCount: {},
      updatedAt: daysAgo(2),
      metadata: { assignmentId: { _id: "asgn_2", title: "Interactive Quiz App" } },
    },
  ],

  calendar: [
    {
      _id: "evt_1",
      type: "class-session",
      source: "auto",
      title: "Live: Flexbox Lab",
      description: "Hands-on flexbox workshop with live code walkthrough.",
      link: "https://meet.example.com/sh",
      location: "Online (Google Meet)",
      start: daysFromNow(0),
      end: daysFromNow(0),
      allDay: false,
      scope: "schedule",
      scopeId: "sched_1",
      isCancelled: false,
      sourceRef: { model: "ClassSession", id: "cs_1" },
      meta: { courseName: "Full-Stack Web Development" },
    },
    {
      _id: "evt_2",
      type: "assignment-due",
      source: "auto",
      title: "Interactive Quiz App due",
      start: daysFromNow(2),
      allDay: false,
      scope: "assignment",
      scopeId: "asgn_2",
      isCancelled: false,
      meta: { courseName: "Full-Stack Web Development", moduleTitle: "JavaScript Essentials" },
    },
    {
      _id: "evt_3",
      type: "office-hours",
      source: "manual",
      title: "Office hours with Ngozi",
      description: "Q&A session covering async JS and Promises.",
      start: daysFromNow(4),
      allDay: false,
      scope: "global",
      isCancelled: false,
    },
    {
      _id: "evt_4",
      type: "announcement",
      source: "manual",
      title: "Mid-Term Project Briefing",
      description: "Overview of requirements for the upcoming capstone project.",
      start: daysFromNow(7),
      allDay: true,
      scope: "global",
      isCancelled: false,
    },
    {
      _id: "evt_5",
      type: "general",
      source: "manual",
      title: "Webinar: Building a Career in Data",
      description: "Panel discussion with industry experts.",
      link: "https://meet.example.com/webinar",
      start: daysFromNow(6),
      allDay: false,
      scope: "global",
      isCancelled: false,
    },
  ],

  activity: [
    {
      _id: "act_1",
      actor: { user: "usr_1", name: "Ade Balogun", email: "ade.balogun@example.com", role: "student" },
      action: "auth.login",
      resource: { type: "session", label: "Web Portal Session" },
      ip: "102.89.23.4",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      createdAt: daysAgo(0),
    },
    {
      _id: "act_2",
      actor: { user: "usr_1", name: "Ade Balogun", role: "student" },
      action: "submission.submit",
      resource: { type: "assignment", id: "asgn_2", label: "Interactive Quiz App" },
      metadata: { submissionType: "url", version: 1 },
      createdAt: daysAgo(1),
    },
    {
      _id: "act_3",
      actor: { user: "usr_1", name: "Ade Balogun", role: "student" },
      action: "submission.resubmit",
      resource: { type: "assignment", id: "asgn_1", label: "Build a Landing Page" },
      metadata: { submissionType: "file", version: 2 },
      createdAt: daysAgo(3),
    },
    {
      _id: "act_4",
      actor: { user: "usr_1", name: "Ade Balogun", role: "student" },
      action: "payment.create",
      resource: { type: "payment", id: "pay_1", label: "Installment #2 Payment" },
      metadata: { amount: 150000, status: "approved" },
      createdAt: daysAgo(5),
    },
    {
      _id: "act_5",
      actor: { user: "usr_1", name: "Ade Balogun", role: "student" },
      action: "profile.update",
      resource: { type: "profile", label: "Banking Details" },
      createdAt: daysAgo(10),
    },
  ],

  notifications: [
    { _id: "ntf_1", type: "grade", title: "Assignment graded", body: "Your landing page scored 84%.", createdAt: daysAgo(1), read: false, actionUrl: "/assignments" },
    { _id: "ntf_2", type: "material", title: "New material added", body: "ES6 Reference added to JavaScript Essentials.", createdAt: daysAgo(2), read: true, actionUrl: "/courses/full-stack-web-development" },
    { _id: "ntf_3", type: "announcement", title: "Cohort announcement", body: "Submission window extended by 24h.", createdAt: daysAgo(3), read: false, actionUrl: "/notifications" },
  ],

  billing: {
    overall: {
      totalPaid: 620000,
      totalDue: 230000,
      totalAmount: 1150000,
      totalDiscount: 100000,
      paymentProgress: 54,
      nextPaymentDue: daysFromNow(14),
    },
    registrations: [
      {
        _id: "reg_1",
        course: { _id: "course_1", name: "Full-Stack Web Development", nameSlug: "full-stack-web-development", mode: "online" },
        schedule: { _id: "sched_1", startDate: daysAgo(30), duration: "6 months" },
        paymentStatus: "completed",
        paymentOption: "installment",
        totalAmount: 500000,
        paidAmount: 500000,
        remainingAmount: 0,
        coursePrice: 550000,
        discountAmount: 50000,
        discountKind: "amount",
        discountValue: 50000,
        discountReason: "promotion",
        discountNote: "Early-bird promotional pricing.",
        nextPaymentDue: null,
        payments: [
          { _id: "pay_1", amount: 250000, paymentDate: daysAgo(30) },
          { _id: "pay_2", amount: 250000, paymentDate: daysAgo(10) },
        ],
      },
      {
        _id: "reg_2",
        course: { _id: "course_2", name: "Python for AI & Data", nameSlug: "python-for-ai-data", mode: "hybrid" },
        schedule: { _id: "sched_2", startDate: daysAgo(8), duration: "5 months" },
        paymentStatus: "pending",
        paymentOption: "installment",
        totalAmount: 350000,
        paidAmount: 120000,
        remainingAmount: 230000,
        coursePrice: 350000,
        discountAmount: 50000,
        discountKind: "amount",
        discountValue: 50000,
        discountReason: "scholarship",
        discountNote: "Partial merit scholarship.",
        nextPaymentDue: daysFromNow(14),
        payments: [{ _id: "pay_3", amount: 120000, paymentDate: daysAgo(8) }],
      },
      {
        _id: "reg_3",
        course: { _id: "course_3", name: "UI/UX Design Foundations", nameSlug: "uiux-design-foundations", mode: "hybrid" },
        schedule: { _id: "sched_3", startDate: daysAgo(45), duration: "4 months" },
        paymentStatus: "waived",
        paymentOption: "installment",
        totalAmount: 300000,
        paidAmount: 0,
        remainingAmount: 300000,
        coursePrice: 300000,
        discountAmount: 0,
        nextPaymentDue: null,
        payments: [],
      },
    ],
  },

  paymentProofs: [
    {
      _id: "pp_1",
      purpose: "course",
      courseName: "Full-Stack Web Development",
      amountClaimed: 250000,
      screenshotUrl: "/mock/proof-1.jpg",
      reference: "ADEB-250000",
      status: "pending",
      createdAt: daysAgo(2),
    },
    {
      _id: "pp_2",
      purpose: "course",
      courseName: "Python for AI & Data",
      amountClaimed: 120000,
      screenshotUrl: "/mock/proof-2.jpg",
      status: "rejected",
      reviewNotes: "Transfer receipt looks incomplete — please upload the full statement.",
      createdAt: daysAgo(12),
      reviewedAt: daysAgo(9),
    },
  ],

  installmentPlans: [
    {
      id: "plan_1",
      enrollmentId: "reg_2",
      courseName: "Python for AI & Data",
      origin: "course",
      planType: "installment",
      status: "active",
      totalAmount: 350000,
      paidAmount: 120000,
      amountDue: 230000,
      accessStatus: "active",
      nextDue: { id: "tr_2", sequence: 2, amount: 115000, dueDate: daysAgo(3), status: "overdue", graceEndsAt: daysFromNow(14) },
      installments: [
        { id: "tr_1", sequence: 1, amount: 120000, dueDate: daysAgo(8), status: "paid", paidAt: daysAgo(8) },
        { id: "tr_2", sequence: 2, amount: 115000, dueDate: daysAgo(3), status: "overdue", graceEndsAt: daysFromNow(14) },
        { id: "tr_3", sequence: 3, amount: 115000, dueDate: daysFromNow(44), status: "pending" },
      ],
    },
    {
      id: "plan_2",
      enrollmentId: "reg_1",
      courseName: "Full-Stack Web Development",
      origin: "scholarship",
      planType: "full_upfront",
      status: "completed",
      totalAmount: 500000,
      paidAmount: 500000,
      amountDue: 0,
      accessStatus: "active",
      installments: [
        { id: "tr_4", sequence: 1, amount: 500000, dueDate: daysAgo(30), status: "paid", paidAt: daysAgo(30) },
      ],
    },
  ],

  siwesRegistrations: [
    {
      registrationId: "reg_siwes_1",
      siwesDurationMonths: 6,
      siwesDurationEditable: true,
      institutionName: "University of Lagos",
      schoolName: "University of Lagos",
    },
    {
      registrationId: "reg_siwes_2",
      siwesDurationMonths: 3,
      siwesDurationEditable: false,
      institutionName: "Yaba College of Technology",
    },
  ],

  acceptanceLetters: [
    {
      registrationId: "reg_siwes_1",
      url: "https://res.cloudinary.com/mock/raw/upload/v1/letters/unilag-letter",
      refNumber: "SIWES-2026-00123",
      issuedAt: daysAgo(10),
      courseName: "Full-Stack Web Development",
      institutionName: "University of Lagos",
      durationMonths: 6,
      durationEditable: true,
    },
    {
      registrationId: "reg_siwes_1_dup",
      url: "https://res.cloudinary.com/mock/raw/upload/v1/letters/unilag-letter",
      refNumber: "SIWES-2026-00123",
      issuedAt: daysAgo(10),
      courseName: "Python for AI & Data",
      institutionName: "University of Lagos",
    },
    {
      registrationId: "reg_siwes_2",
      url: "https://res.cloudinary.com/mock/raw/upload/v1/letters/yaba-letter",
      refNumber: "SIWES-2026-00089",
      issuedAt: daysAgo(30),
      institutionName: "Yaba College of Technology",
      durationMonths: 3,
    },
  ],

  instructorEarnings: {
    totals: { pendingNaira: 260000, processingNaira: 120000, paidNaira: 800000 },
    byKind: { baseNaira: 500000, variableNaira: 580000, bonusNaira: 100000 },
    cohorts: [
      { scheduleId: "sched_1", course: "Full-Stack Web Development", stream: "course", startDate: daysAgo(30), endDate: daysFromNow(120), pending: 85000, paid: 400000 },
      { scheduleId: "sched_2", course: "Python for AI & Data", stream: "course", startDate: daysAgo(8), endDate: daysFromNow(160), pending: 175000, paid: 250000 },
      { course: "Web Accessibility Deep Dive", stream: "foundational", startDate: daysAgo(60), pending: 0, paid: 150000 },
    ],
    payouts: [
      { _id: "payout_1", totalAmount: 400000, status: "pending", createdAt: daysAgo(1), bankName: "GTBank" },
      { _id: "payout_2", totalAmount: 300000, status: "paid", createdAt: daysAgo(40), processedAt: daysAgo(35), bankName: "GTBank" },
    ],
  },

  earningsBreakdown: [
    {
      scheduleId: "sched_1",
      course: "Full-Stack Web Development",
      model: "legacy-50",
      isFlat: true,
      effectiveSharePct: 50,
      yourEntitlementNaira: 200000,
      totalRevenueNaira: 400000,
      students: [
        { name: "Chidi Eze", email: "chidi.eze@example.com", paidNaira: 250000, yourCutNaira: 125000 },
        { name: "Zainab Sanni", paidNaira: 150000, yourCutNaira: 75000 },
      ],
    },
    {
      scheduleId: "sched_2",
      course: "Python for AI & Data",
      model: "main-track",
      isFlat: false,
      effectiveSharePct: 30,
      yourEntitlementNaira: 90000,
      totalRevenueNaira: 300000,
      students: [
        { name: "Amina Bello", email: "amina.bello@example.com", paidNaira: 300000 },
      ],
    },
  ],

  webinars: [
    {
      _id: "web_1",
      title: "Building a Career in Data",
      nameSlug: "career-in-data",
      description: "Panel on breaking into data roles.",
      date: daysFromNow(6),
      speakers: ["Ngozi Okonkwo", "Dr. Yusuf Adamu"],
      tags: ["data", "career"],
      liveLink: "https://meet.example.com/webinar",
      recordingLink: "https://youtube.example.com/xyz",
      posterUrl: "/mock/webinar-data.png",
      isAvailable: true,
      reservationsOpen: true,
      externalResources: [],
    },
    {
      _id: "web_2",
      title: "Intro to AI Tools",
      nameSlug: "intro-ai-tools",
      description: "Hands-on intro to LLM tooling.",
      date: daysAgo(20),
      speakers: ["Sola Adeyemi"],
      tags: ["ai"],
      recordingLink: "https://youtube.example.com/abc",
      posterUrl: "/mock/webinar-ai.png",
      isAvailable: true,
      reservationsOpen: false,
      externalResources: [],
    },
  ],

  internships: [
    {
      _id: "int_1",
      internName: "Ade Balogun",
      internEmail: "ade.balogun@example.com",
      product: { key: "python-ai", name: "Python for AI & Data" },
      mentor: { name: "Ngozi Okonkwo", email: "ngozi.okonkwo@example.com", title: "Lead Instructor" },
      startDate: daysAgo(7),
      endDate: daysFromNow(83),
      status: "active",
      progressPercent: 15,
      checkIns: [
        { _id: "ci_1", weekOf: daysAgo(7), summary: "Set up environment, began first task.", hoursLogged: 8, submittedAt: daysAgo(6) },
        { _id: "ci_2", weekOf: daysAgo(0), summary: "Cleaned the CSV, submitted the script.", hoursLogged: 11, submittedAt: daysAgo(1), mentorFeedback: "Great structure — try adding CLI flags to re-run it on new files." },
      ],
      tasks: [
        { _id: "it_1", internship: "int_1", title: "Set up dev environment", description: "Install Python, VS Code, git.", status: "done", order: 1, submittedAt: daysAgo(5) },
        { _id: "it_2", internship: "int_1", title: "Build a data-cleaning script", description: "Clean the provided CSV.", status: "in_progress", order: 2, dueDate: daysFromNow(4) },
        { _id: "it_3", internship: "int_1", title: "Weekly check-in", status: "todo", order: 3, dueDate: daysFromNow(2) },
        { _id: "it_4", internship: "int_1", title: "README for the pipeline", status: "submitted", order: 4, submissionUrl: "https://github.com/example/pipeline", submissionNote: "First pass — feedback welcome.", submittedAt: daysAgo(2) },
      ],
    },
  ],

  scholarship: [
    {
      _id: "sch_1",
      cohort: "2026 Cohort A",
      track: "web-dev",
      stage: "enrolled",
      awardedTier: "full",
      siwesCouponCode: "SIWES-WEB-2026",
      createdAt: daysAgo(45),
    },
    {
      _id: "sch_2",
      cohort: "2026 Cohort A",
      track: "cyber",
      stage: "applied",
      createdAt: daysAgo(12),
    },
  ],

  teaching: [
    {
      _id: "sched_1",
      startDate: daysAgo(30),
      endDate: daysFromNow(120),
      duration: "6 months",
      studentCount: 34,
      progress: 46,
      course: {
        _id: "course_1",
        name: "Full-Stack Web Development",
        nameSlug: "full-stack-web-development",
        mode: "online",
        imageUrl: "/mock/course-web.png",
        description: "Build and ship production web apps end-to-end.",
      },
    },
    {
      _id: "sched_2",
      startDate: daysAgo(8),
      endDate: daysFromNow(160),
      duration: "5 months",
      studentCount: 21,
      progress: 12,
      course: {
        _id: "course_2",
        name: "Python for AI & Data",
        nameSlug: "python-for-ai-data",
        mode: "hybrid",
        imageUrl: "/mock/course-python.png",
        description: "Python fundamentals to machine learning.",
      },
    },
  ],
};

/** Referral dashboard snapshot (`GET /lms/account/referrals`). */
export const mockReferrals: ReferralsResponse = {
  eligible: true,
  code: "ADEBALO25",
  uses: 3,
  qualifiedCount: 2,
  commissionRate: 10,
  totals: { pendingNaira: 45000, earnedNaira: 120000, paidNaira: 75000 },
  records: [
    {
      _id: "ref_1",
      status: "qualified",
      commission: 25000,
      amount: 250000,
      firstPaymentAmount: 250000,
      referred: {
        firstName: "Chidi",
        lastName: "Eze",
        email: "chidi.eze@example.com",
      },
      registration: {
        course: {
          _id: "course_2",
          name: "Python for AI & Data",
          nameSlug: "python-for-ai-data",
        },
        createdAt: daysAgo(20),
      },
      createdAt: daysAgo(20),
    },
    {
      _id: "ref_2",
      status: "pending",
      potentialAmount: 85000,
      referred: { firstName: "Zainab", lastName: "Sanni" },
      registration: {
        course: {
          _id: "course_1",
          name: "Full-Stack Web Development",
          nameSlug: "full-stack-web-development",
        },
        createdAt: daysAgo(2),
      },
      createdAt: daysAgo(2),
    },
    {
      _id: "ref_3",
      status: "paid",
      commission: 50000,
      amount: 500000,
      firstPaymentAmount: 500000,
      referred: { firstName: "Tunde", lastName: "Adeyemi" },
      registration: { course: "course_1", createdAt: daysAgo(40) },
      createdAt: daysAgo(40),
    },
  ],
};

/** Banking details snapshot (`GET /lms/account/banking`). */
export const mockBanking = {
  bankName: "GTBank",
  accountName: "Oluwaseun Ade Balogun",
  accountNumber: "0123456789",
  payoutEmail: "ade.balogun@example.com",
  updatedAt: daysAgo(3),
};

/** Internship payment (`GET /lms/internships/me/payment`). Pending with
 *  no proof yet so the payment banner prompts "Upload proof". */
export const mockInternshipPayment: WireInternshipPayment = {
  applicationId: "app_int_1",
  applicantName: "Ade Balogun",
  applicantEmail: "ade.balogun@example.com",
  fee: 150000,
  paidAmount: 0,
  paymentStatus: "pending",
  bank: {
    bankName: "GTBank",
    accountName: "SmartHub Academy",
    accountNumber: "0987654321",
    paymentInstructions:
      "Use your full name + 'internship fee' as the reference, then upload your receipt below.",
  },
};

/** Completed variant — proves the payment banner/page self-gating
 *  branches (banner null, page shows the confirmed strip). */
export const mockInternshipPaymentSettled: WireInternshipPayment = {
  applicationId: "app_int_1",
  applicantName: "Ade Balogun",
  applicantEmail: "ade.balogun@example.com",
  fee: 150000,
  paidAmount: 150000,
  paymentStatus: "completed",
  paymentProofUrl: "/uploads/2",
  paymentProofSubmittedAt: daysAgo(6),
  paymentReference: "Oluwaseun Ade Balogun — internship fee",
  paymentConfirmedAt: daysAgo(4),
  bank: {
    bankName: "GTBank",
    accountName: "SmartHub Academy",
    accountNumber: "0987654321",
  },
};

/** Help library feed (`GET /lms/help?mode=…`). Three categories; the
 *  instructor-only one trims out of the student feed. */
export const mockHelpResources: WireHelpResource[] = [
  {
    _id: "h_1",
    title: "How to join a live class",
    description: "From the classroom link in your schedule.",
    type: "video",
    url: "/mock/help-join-class.mp4",
    thumbnailUrl: "/mock/help-join-class.png",
    category: "Getting started",
    audience: "all",
    order: 1,
    createdAt: daysAgo(30),
  },
  {
    _id: "h_2",
    title: "Navigating the dashboard",
    description: "Courses, progress and your next class at a glance.",
    type: "document",
    url: "/mock/help-dashboard.pdf",
    category: "Getting started",
    audience: "all",
    order: 2,
    createdAt: daysAgo(28),
  },
  {
    _id: "h_3",
    title: "Understanding your bill",
    description: "Installments, discounts and paid-in-full states.",
    type: "document",
    url: "/mock/help-billing.pdf",
    category: "Payments & billing",
    audience: "student",
    order: 1,
    createdAt: daysAgo(20),
  },
  {
    _id: "h_4",
    title: "Upload a payment receipt",
    description: "How to match your transfer to your account.",
    type: "link",
    url: "https://help.example.com/smarthub/payments",
    category: "Payments & billing",
    audience: "student",
    order: 2,
    createdAt: daysAgo(18),
  },
  {
    _id: "h_5",
    title: "Grading assignments",
    description: "Rubrics, comments and publishing grades.",
    type: "video",
    url: "/mock/help-grading.mp4",
    thumbnailUrl: "/mock/help-grading.png",
    category: "Teaching tools",
    audience: "instructor",
    order: 1,
    createdAt: daysAgo(15),
  },
  {
    _id: "h_6",
    title: "Reading cohort earnings",
    description: "Your share, thresholds and payouts.",
    type: "document",
    url: "/mock/help-earnings.pdf",
    category: "Teaching tools",
    audience: "instructor",
    order: 2,
    createdAt: daysAgo(12),
  },
];

/** Branding payload (`GET /platform/branding`). Logo + social links the
 *  shell renders; svg is what `Logo` uses (with the bundled fallback). */
export const mockBranding = {
  logos: {
    primary: {
      svg: "/images/smarthub-logo-color.svg",
      png: "/images/smarthub-logo-color.png",
      png2x: "/images/smarthub-logo-color@2x.png",
    },
    color: {
      svg: "/images/smarthub-logo-color.svg",
      png: "/images/smarthub-logo-color.png",
      png2x: "/images/smarthub-logo-color@2x.png",
    },
    dark: {
      svg: "/images/smarthub-logo-dark.svg",
      png: "/images/smarthub-logo-dark.png",
      png2x: "/images/smarthub-logo-dark@2x.png",
    },
  },
  socials: [
    {
      key: "instagram",
      label: "Instagram",
      url: "https://instagram.com/smarthubacademy",
      iconUrl: "/images/socials/instagram.svg",
    },
    {
      key: "x",
      label: "X",
      url: "https://x.com/smarthubacademy",
      iconUrl: "/images/socials/x.svg",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      url: "https://linkedin.com/company/smarthubacademy",
      iconUrl: "/images/socials/linkedin.svg",
    },
    {
      key: "youtube",
      label: "YouTube",
      url: "https://youtube.com/@smarthubacademy",
      iconUrl: "/images/socials/youtube.svg",
    },
  ],
};

/** Standalone modules granted directly to the student. */
export const mockAssignedModules: ApiAssignedModule[] = [
  {
    _id: "amd_1",
    title: "Web Accessibility Deep Dive",
    titleSlug: "web-accessibility-deep-dive",
    description:
      "A focused module on making web apps usable for everyone — donated by your instructor.",
    estimatedDuration: "3–4 hours",
    learningObjectives: [
      "Apply WCAG 2.1 AA criteria",
      "Test with screen readers",
      "Fix common accessibility regressions",
    ],
    assignedAt: daysAgo(6),
    note: "Go through this before the interview prep block.",
    recordings: [
      recording("rec_10", "A11y Foundations", 24, false, "published"),
    ],
    materials: [
      material("mat_10", "WCAG Quick Guide", "guide", "pdf"),
    ],
    assignments: [
      {
        _id: "aasgn_1",
        title: "Audit a live page",
        module: "amd_1",
        dueDate: daysFromNow(4),
        totalPoints: 50,
        type: "assignment",
        description: "Run an axe scan and report the findings.",
      },
    ],
  },
  {
    // Deliberately no titleSlug — the assigned page deep-links by id,
    // exercising the `slug → _id` fallback for standalone modules.
    _id: "amd_2",
    title: "Git Workflow Primer",
    description:
      "A crash refresher on branching, rebasing and clean history — granted ahead of the team project.",
    estimatedDuration: "2 hours",
    learningObjectives: [
      "Reconcile a branch without merge-commit noise",
      "Rewrite a commit history safely",
    ],
    assignedAt: daysAgo(3),
    note: "Run through this before the first project sprint call.",
    recordings: [
      recording("rec_11", "Branching & PRs", 19, false, "published"),
    ],
    materials: [
      material("mat_11", "Git Cheat Sheet", "reference", "pdf", {
        cloudinary: true,
      }),
    ],
    assignments: [
      {
        _id: "aasgn_2",
        title: "Fix the tangled history",
        module: "amd_2",
        dueDate: daysFromNow(7),
        totalPoints: 30,
        type: "module-project",
        description: "Rebase a squashed branch onto main and open a PR.",
      },
    ],
  },
];

/** Gamification pulse (`GET /lms/me/progress-pulse`). */
export const mockProgressPulse: ProgressSnapshot = {
  totalSubmissions: 6,
  onTimeSubmissions: 4,
  onTimePct: 67,
  currentStreak: 3,
  masteryAvgPct: 78,
  pendingAssignments: 2,
  gradedCount: 3,
};

function wireInstructorRef() {
  return {
    _id: "usr_2",
    firstName: "Ngozi",
    lastName: "Okonkwo",
    email: "ngozi.okonkwo@example.com",
    imageUrl: "/mock/ngozi.jpg",
    bio: "Full-stack engineer and educator.",
    jobTitle: "Lead Instructor",
    whatsapp: "+2348098765432",
  };
}

function recording(
  id: string,
  title: string,
  duration: number,
  watched: boolean,
  status: "draft" | "published" | "archived",
  opts: {
    /** Provider shape for `classifyVideoUrl`. Defaults to a plain
     *  direct file so the classifier returns `video`. */
    provider?: "youtube" | "vimeo" | "drive" | "video";
    /** Multi-part: expose ≥2 links and mirror `videoUrl` to link 0. */
    parts?: number;
    /** Withhold from this viewer — never playable. */
    locked?: boolean;
    description?: string;
  } = {},
): WireRecording {
  const { provider = "video", parts = 1, locked, description } = opts;
  const idFor = (n: number) => `${id}/p${n}`;
  const partsLinks = Array.from({ length: parts }, (_, n) => ({
    name: `Part ${n + 1}`,
    url: `https://mock.smarthub.dev/rec/${idFor(n + 1)}`,
  }));
  const videoUrl =
    provider === "youtube"
      ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      : provider === "vimeo"
        ? "https://vimeo.com/76979871"
        : provider === "drive"
          ? "https://drive.google.com/file/d/1aZbYcDeFg1234567890/view"
          : `https://res.cloudinary.com/mock/video/upload/v1/rec/${id}.mp4`;
  return {
    _id: id,
    title,
    description,
    duration,
    durationLabel: `${duration} min`,
    // Locked recordings have their `videoUrl` withheld server-side —
    // the player must never receive a playable source for them.
    videoUrl: locked ? undefined : videoUrl,
    links: parts > 1 ? partsLinks : [{ name: "Part 1", url: videoUrl }],
    thumbnailUrl: `/mock/rec-${id}.png`,
    publishedAt: daysAgo(20),
    status,
    watched,
    isLockedForViewer: locked,
  };
}

function material(
  id: string,
  title: string,
  category: "guide" | "presentation" | "exercise" | "reference",
  fileType: "pdf" | "slide" | "exercise" | "link",
  opts: {
    /** Cloudinary (extensionless) URL → exercises the blob-wrap seam. */
    cloudinary?: boolean;
    /** Drive-hosted link. */
    drive?: boolean;
    /** Multi-file material (links.length > 1). */
    multi?: boolean;
    /** Instructions-only guide: no fileUrl, just a description. */
    guideOnly?: boolean;
    description?: string;
    size?: number;
  } = {},
) {
  const { cloudinary, drive, multi, guideOnly, description, size } = opts;
  const url = drive
    ? "https://drive.google.com/file/d/1DriveFile12345/view"
    : cloudinary
      ? "https://res.cloudinary.com/mock/raw/upload/v1/materials/legacy-no-ext"
      : `https://res.cloudinary.com/mock/raw/upload/v1/materials/${id}`;
  const links = multi
    ? [
        { name: "Part A", url: `${url}-a` },
        { name: "Part B", url: `${url}-b` },
      ]
    : guideOnly
      ? []
      : [{ name: title, url }];
  return {
    _id: id,
    title,
    category,
    fileType,
    description,
    fileUrl: guideOnly ? undefined : url,
    fileSize: size,
    links,
    tags: [category],
  };
}

function assignment(
  id: string,
  title: string,
  _module: string,
  totalPoints: number,
  dueInDays: number,
  opts: {
    status?: WireAssignment["status"];
    course?: string;
    priority?: WireAssignment["priority"];
  } = {},
) {
  return {
    _id: id,
    title,
    instructions: "Follow the brief in the resource link and submit before the deadline.",
    description: `Submission for ${title}.`,
    assignmentLink: "https://docs.example.com/brief",
    links: [],
    type: "assignment" as const,
    priority: opts.priority ?? "medium",
    dueDate: daysFromNow(dueInDays),
    totalPoints,
    allowLateSubmission: true,
    status: opts.status ?? "submitted" as const,
    module: _module,
    course: opts.course ?? "course_1",
  };
}

function submissionFor(
  assignmentId: string,
  userId: string,
  overrides: Partial<WireSubmission> = {},
): WireSubmission {
  return {
    _id: `sub_${assignmentId}_${userId}`,
    assignment: assignmentId,
    user: userId,
    course: "course_1",
    submissionType: "file",
    fileName: "landing-page.zip",
    fileUrl: "https://mock.smarthub.dev/sub/landing.zip",
    fileMimeType: "application/zip",
    notes: "Here is my landing page project.",
    status: "submitted",
    submittedAt: daysAgo(2),
    isLateSubmission: false,
    version: 1,
    submissionHistory: [
      { action: "submitted", timestamp: daysAgo(2), notes: "Initial submission" },
    ],
    ...overrides,
  };
}

/** In-memory mutable copy so mutation handlers can append/edit records. */
export const createMutableDatabase = (seed: MockDatabase): MockDatabase => ({
  ...seed,
  courses: [...seed.courses],
  modules: Object.fromEntries(
    Object.entries(seed.modules).map(([k, v]) => [k, [...v]]),
  ),
  submissions: [...seed.submissions],
  conversations: [...seed.conversations],
  calendar: [...seed.calendar],
  activity: [...seed.activity],
  notifications: [...seed.notifications],
  webinars: [...seed.webinars],
  internships: [...seed.internships],
  scholarship: [...seed.scholarship],
  teaching: [...seed.teaching],
  paymentProofs: [...seed.paymentProofs],
  installmentPlans: [...seed.installmentPlans],
  siwesRegistrations: [...seed.siwesRegistrations],
  acceptanceLetters: [...seed.acceptanceLetters],
});
