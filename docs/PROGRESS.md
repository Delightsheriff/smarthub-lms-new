# SmartHub LMS Port — Progress & Checklist

Living status doc for the port. Each plan has a checklist of its
deliverables; boxes are checked as they land. Use this to see everything
done so far and where we're at.

**Master context:** `plans/PORTING.md` · **Domain glossary:** `CONTEXT.md` ·
**Decisions:** `docs/adr/` · **Plan 002 outline:** `docs/PLAN-002-OUTLINE.md`

---

## Legend

- ✅ **Done** — built, verified (typecheck/lint/build), committed
- 🔨 **In progress** — being worked on right now
- ⬜ **Open / confirmed** — plan acknowledged by user, code not written
- 🚫 **Deferred** — deliberately postponed (with reason)

---

## Plan 001 — Foundation ✅

**Status: BUILT** — committed `e10adca` (2026-08)

| Deliverable | Status |
|---|---|
| Runtime + dev deps installed | ✅ |
| Contract mirror — `lib/api/constants.ts` (enums) | ✅ |
| Wire types — `lib/api/wire.types.ts` (string ids, nested sub-docs) | ✅ |
| Shared types — `lib/api/types.ts` (envelope + `ApiError`) | ✅ |
| Data-source seam — `lib/api/client.ts` (`get/post/put/patch/delete/getBlob`) | ✅ |
| Mock db — `lib/api/mock/mockDatabase.ts` (wire-faithful fixtures) | ✅ |
| Mock handlers — `lib/api/mock/router.ts` | ✅ |
| Barrel — `lib/api/index.ts` | ✅ |
| `lib/utils.ts` extended (`formatPrice`, `formatDate`, `timeAgo`, `htmlToPlainText`, …) | ✅ |
| `lib/constants/` — `api.ts`, `storage.ts` | ✅ |
| `lib/services/storage.service.ts` | ✅ |
| `lib/mime-extension.ts`, `lib/module-progress.ts`, `lib/image.ts`, `lib/cloudinary-download.ts` | ✅ |
| Socket seam — `lib/socket/socket-provider.tsx` (mock emitter) | ✅ |
| Stores — `authStore` (mock-seeded), `roleModeStore`, `sidebarStore`, `uiStore` | ✅ |
| `types/auth.ts` (`AuthUser`) | ✅ |
| Configs — `configs/brand.ts`, `configs/nav.ts` | ✅ |
| Hooks — `useEffectiveMode`, `usePageParam`, `useNotificationChime`, `useTitleNotifier` | ✅ |
| Providers — `QueryProvider`, `AppProviders`; root layout wired | ✅ |
| Animation folder — `FadeIn`, `Stagger`/`StaggerItem` | ✅ |
| `CONTEXT.md` glossary seeded | ✅ |
| `docs/adr/` — 5 foundation ADRs | ✅ |
| Verify: typecheck / lint / build / dev-boot | ✅ |
| **Commit (incremental lesson learned)** | ✅ |

---

## Plan 002 — App Shell & Route Skeleton ✅

**Status: BUILT** — incremental commits, 2026-08.
**Next-16 note:** `middleware.ts` is deprecated → we use `next.config.ts`
`headers()` for noindex (no `proxy.ts` yet; deferred to Plan 012 auth).

| Deliverable | Status |
|---|---|
| Root layout: Inter font, metadata (title template, noindex), viewport, `AppProviders` | ✅ `7860f65` |
| `next.config.ts` `headers()` → `X-Robots-Tag: noindex, nofollow` | ✅ `7860f65` |
| Root `app/page.tsx` → redirect `/dashboard` | ✅ `7860f65` |
| Global files: `manifest.ts`, `robots.ts`, `instrumentation.ts`, `not-found.tsx`, `global-error.tsx` (all Next-16-correct) | ✅ `8bb1cbb` |
| `(app)` route group + `layout.tsx` + `AppShell` (auth gating, redirect to `/login`) | ✅ `0be319d` |
| 20 `(app)` route stubs via `ComingSoon` (shadcn `Card`+`Skeleton`) | ✅ `bdf9f09` |
| shadcn `skeleton` + `card` primitives | ✅ `bdf9f09` |
| `(auth)` route group + centered panel layout + 4 stubs (`auth-placeholder`) | ✅ `90e5bac` |
| shadcn consistency pass (global-error button → shadcn `Button`) | ✅ `bdf9f09` |
| ADR 0006: `(app)`/`(auth)` split + gating layering; `headers` over `proxy` | ✅ `d0de220` |
| Verify: typecheck / lint / build (29 routes, webmanifest + robots generated) | ✅ |
| **Commit — INCREMENTAL (6 units, not one lump)** | ✅ |

---

## Plan 003 — Navigation Chrome ✅

**Status: BUILT** — incremental commits, 2026-08.

**Notes:** shadcn `sidebar`/`dropdown-menu`/`sheet`/`alert-dialog`/`avatar`
(built on `@base-ui/react` — **`render` prop, not `asChild`**). The nav *
data* is a pure seam (`configs/nav.ts`); toggling the dropdown's label had
to wrap `DropdownMenuLabel` in a `DropdownMenuGroup` for base-ui's
`Menu.Group` context (fix `a124f5b`). Nav-composition unit tests are
**deferred to the Plan 005 Vitest harness** (per plan; no test runner yet).

| Deliverable | Status |
|---|---|
| shadcn base-ui primitives: `avatar`, `badge`, `dropdown-menu`, `alert-dialog`, `sheet`, `input`, `separator`, `tooltip`, `sidebar` | ✅ commit 1 |
| Global `hooks/use-mobile.ts` rewritten (useSyncExternalStore; shadcn-gen violated lint) | ✅ commit 1 |
| `Logo` (legacy SVGs copied → `public/images/`), `ThemeToggle` (`use-mounted` sync-external-store) | ✅ commit 2 |
| `RoleSwitcher` (student/instructor, expanded vs collapsed) | ✅ commit 2 |
| `AppSidebar` — desktop rail (`Sidebar collapsible="icon"`, render-prop links, inbox badge `9+/99+`) | ✅ `677901c` |
| `useInboxUnreadCount` (sums `mockDatabase.conversations[].unreadCount[userId]`) | ✅ `677901c` |
| `BottomNav` — mobile pinned bar (4 items + More sheet, iOS safe-area) | ✅ `c2034d5` |
| `TopBar` + `UserMenu` (gated sign-out via `AlertDialog`) | ✅ commit 5 |
| Shell chrome in `AppShell` — controlled `SidebarProvider` (`open`/`onOpenChange` → `sidebarStore`) | ✅ `16f2ad9` |
| `MessageToastListener` (mock socket `message:new` → toast) + `CommandPaletteListener` (⌘K → `uiStore.searchOpen`, no dialog) | ✅ `16f2ad9` |
| Dropped `uiStore.sideNavCollapsed` duplicate (single source = `sidebarStore`) | ✅ `16f2ad9` |
| ADR 0007 (nav data/rendering seam) + README index | ✅ `db557d0` |
| Verify: typecheck / lint / **build (27 routes)** | ✅ |

---

## Plan 004 — Dashboard ✅

**Status: BUILT** — incremental commits, 2026-08.

**Notes:** shadcn base-ui primitives. Module cores → mock top-up → consuming
widgets → dashboard composition → ADR, per plan §6. Instructor teaching
dashboard deferred to Plan 011 (in-place `ComingSoon` placeholder). Calendar
`MonthGrid`/`EventDetailDialog` deferred to Plan 007 (lighter
`UpcomingDeadlinesPanel` this plan). Status nags = billing + referrals only
(acceptance-letter/internship/scholarship to Plans 009–010). No `modules/auth`
in target — `useAuthStore` + `useEffectiveMode()`.

| Deliverable | Status |
|---|---|
| 8 module cores — learning, courses, assignments, billing, referrals, webinars, assigned-modules, progress (`api` + `components` + `config` + `types`) | ✅ `01fb555` |
| Mock fixtures top-up (`assignment()` opts, referrals, banking, assigned-modules, progress-pulse) + router handlers (courses alias, payments summary, account/me, referrals, banking, assigned, progress-pulse, achievements, cohort-pulse) | ✅ `2cac8ae` |
| 6 consuming widgets (billing, referrals, webinars, assigned-modules, progress-pulse, upcoming-deadlines) — each self-gates to `null` | ✅ `67b7fa2` |
| Dashboard-local components — `StatsStrip`, `CourseProgressList` (assignments rollup via module query surface) | ✅ `47ca852` |
| `CourseCard` (rebuilt on base-vega; no `success` badge variant, mapped) | ✅ `47ca852` |
| `DashboardPage` + `StudentDashboardBody` — composition order + role branch; route wired | ✅ `47ca852` |
| ADR 0008 (dashboard is a composition point, not a module) + README index | ✅ `12b53fd` |
| Verify: typecheck / lint / **build (28 routes)** | ✅ |

---

## Plan 005 — Courses & Learning ✅

**Status: BUILT** — 6 incremental commits (`1df4743`…`8aa9a79`), 2026-08.

**Notes:** All four §8 open questions confirmed by user (Assignment stays in
`assignments` module; static placeholder curriculum PDF; Vitest added here;
real reachable sample assets). Plan 004's module cores already carried the
data layer — this plan delivered presentation + mock content + tests + ADR.
One normalisation taproot (`modules/learning/api/normalise.ts`) + one URL
classifier (`classifyVideoUrl`) serve every surface; no `success`/`accent`
badge variants exist, mapped to valid ones. Instructor courses branch
deferred to Plan 011 — student body only.

| Deliverable | Status |
|---|---|
| **Commit A** — Vitest harness (`vitest.config.ts`, `test` script) + content-rich mock seed (recording/material helpers w/ providers, multi-part, locked, drive, cloudinary; courses recs/mats; course_3 + mod_6/7/8; enriched assigned) + router handlers (course detail, my recordings/materials, view/download patches) + shadcn accordion+tabs | ✅ `1df4743` |
| **Commit B** — `classifyVideoUrl` (video/youtube/vimeo/drive/external), `use-previewable-url` (no effect setState), `RichText` + `CollapsibleRichText` (motion) | ✅ `63f81cf` |
| **Commit C** — `modules/learning` endpoints/service/`content.queries`, `recording-player-dialog`, `material-preview-dialog`, `module-section` (Recordings/Materials/Assignments), recordings/materials feeds | ✅ `c488c69` |
| **Commit D** — `course-module-row` (motion, valid badges), `course-outline`, `CoursesPageContent` (student body, dropdown filters), `CourseDetailPageContent`, `CourseModulePageContent` — all `render`-prop triggers, `text-emerald-600`, no `Accordion type=` prop | ✅ `1cdd64d` |
| **Commit E** — `AssignedModulesPageContent` + route wiring (courses list, `[slug]` detail + layout two-pane/Sheet, `[slug]/modules/[moduleSlug]`, recordings, materials, assigned) | ✅ `fb3b408` |
| **Commit F** — 4 Vitest test files (34 tests: normalisers + URL classifier) + ADR 0009 (shared normalisation taproot) | ✅ `8aa9a79` |
| Verify: typecheck / lint / **build (32 routes)** / 34 tests / dev-boot (6 routes 200) | ✅ |

---

## Plan 009 — Profile / Payments / Billing / SIWES / Referrals ✅

**Status: BUILT + QAd** — incremental commits, 2026-08; all 13 verification
box-items checked in `plans/009-…md` after an agent-browser walkthrough. QA
caught+fixed: referrals ledger rendered the commission **amount** as a rate
(`25000%`) → derived `commission/amount`; Full-Stack cohort detail student rows
summed to 800k paid/400k cuts against a 400k/200k summary → reconciled;
pending ledger row now shows the `Potential ₦85,000` callout (earned 0).

**Notes:** Security is a **tab, not a page** — deviation from legacy, which
routed password change out to `/profile/security` and left the tab strip with
a dead trigger; `ChangePasswordForm` renders in-place with `?tab=security`
deep-link (no `/profile/security` route). Profile page identities/verifies,
Student+Cohort Earnings branch on `/billing` via `useEffectiveMode`. Gates
mounted in `AppShell`: `ProfilePhotoGate` (shell root) → `PaymentStatusBanner`
(above `main`) → `PaymentGate` (wrapping children; `resolvePaymentGate` pure
decision, path-boundary-aware ALWAYS_OPEN). `resolvePaymentGate` also fixed a
legacy `startsWith` boundary bug (`/payments-archived` no longer reads as the
open surface). No `/profile/security` route exists. Achievements/Notifications
tabs = self-gating placeholders (progress/push modules land later). AVATAR
`no-img-element` lint fixed via shadcn `Avatar`. Billing normaliser clamps
progress 0–100 (test-caught gap). ADRs continue the `000N` sequence → **0010**
(payment seam) + **0011** (storage/upload seam).

| Deliverable | Status |
|---|---|
| Profile module — `AvatarUploader` (shadcn Avatar, no raw img), `EditProfileDetailsDialog`, `BankingTab`, `ProfessionalTab`, `AttendancePinSection`, `ProfilePhotoGate`, `profile.service`/`queries` | ✅ |
| Payment-proofs module — `PaymentsPageContent`, `InstallmentScheduleCard`, `PaymentGate` (pure `resolvePaymentGate`), `PaymentStatusBanner` | ✅ |
| Billing module wiring — `BillingPageContent`, `BillingSummaryCard`, `RegistrationBillingCard`, `DashboardBillingWidget` + `/billing` mode branch | ✅ |
| SIWES module — `SiwesPlacementTab`, passthrough normaliser + query (60s stale), editable/locked rows | ✅ |
| Acceptance-letters module — `AcceptanceLetterCard` (view/download via `cloudinary-download`), `EditSiwesDurationDialog` (1–12, invalidates letters+siwes keys), normalise (`issuedAt→Date`) + `dedupeAcceptanceLetters` (extracted pure fn) | ✅ |
| Instructor-earnings module — `InstructorEarningsPageContent`, `CohortEarningsDetailContent`, totals/byKind/payouts, bank-nudge via `useBankingDetails` | ✅ |
| Referrals module — `CopyableCode`, `ProgramShareLink` (env/subdomain origin, copy+WhatsApp), `ReferralsPanel` (shadcn Tabs: share/earnings/ledger/payouts) | ✅ |
| Auth — `PasswordInput` (composes base-vega `Input`), `ChangePasswordForm` + `useChangePassword` (`/auth/set-password`), Security as in-place tab | ✅ |
| Route pages — `/profile` (tab strip + `?tab=` sync + Security tab), `/billing` (mode branch), `/billing/cohort/[scheduleId]` (Next 16 `useParams`), `/payments`, `/refer-and-earn`, `/check-in` (token+session state machine incl. 401/403/410, single-fire ref, auto-redirect) | ✅ |
| Shell mounts — `ProfilePhotoGate` → `PaymentStatusBanner` → `PaymentGate` inside `AppShell` (below auth gate) | ✅ |
| Tests — billing normaliser (incl. progress clamp + discount-presence), acceptance normalise + dedupe, payment-gate decision, profile mock PATCH-fold + banking put + avatar clear | ✅ |
| ADRs — 0010 payment seam, 0011 storage/upload seam (README indexed) | ✅ |
| Verify: typecheck / lint / **60 tests** / build (29 routes) | ✅ |

## Plan 010 — Programs + AI + Help (Internships / Scholarship / Oreo / Help / Branding) ✅

**Status: BUILT + QAd.** All §7 acceptance checks ticked after a live
agent-browser walkthrough; QA-healthy issues fixed during the pass (below).

Quick summary of the QA pass:
- Walked every 010 surface against the dev server — internships workspace
  (task start / submit / check-in composer), payment pending + upload-proof →
  **awaiting-confirmation** state, scholarship share dialog, Oreo (suggestions,
  markdown render, tool-steps, fallback, New chat), `/help` both mode filters,
  branding in the shell.
- **Mock seam fix (`lib/api/client.ts`):** `exec` now deep-copies every
  response. Handlers returning live singletons meant an in-place mutation left
  the next response reference-equal to the cached query value; React Query's
  structural sharing silently dropped the update (payment proof never surfaced).
- **Payment state machine:** banner self-gates once a proof is submitted; payment
  page adds the **awaiting confirmation** card (reference + submitted date)
  between pending and the confirmed strip.
- **Mock assets:** all `/mock/*` fixture media (banner, course/webinar images,
  avatars, help videos + posters, help PDFs) generated under `public/mock/` —
  they previously 404'd in the live surfaces.

**Scope (user-confirmed, §8):** check-in shipped under 009 (no build here) ·
Oreo "How I got this" = collapsed read-only panel · scholarship is a dashboard
card only (no route) · shell `Logo` swaps to `useBranding` (bundled fallback) ·
`ScholarshipPhotoGate` = upload-persist, no crop (`react-easy-crop` deferred) ·
Oreo mock = single resolved `AskAnswer` ~650ms (streaming states render).

| Deliverable | Status |
|---|---|
| Mock — wire `WireInternshipPayment` + `WireHelpResource`; fixtures (payment pending + settled, inert `applied` scholarship, help library, branding); intern role + enriched tasks/check-ins; router handlers (internships me/tasks/:id/check-ins/payment/payment-proof, scholarship me/banner/photo, oreo ask+stream+usage, help, `/platform/branding`) | ✅ |
| Canned Oreo — `lib/api/mock/oreo-canned.ts` (deterministic ask → `AskAnswer`, fallback, near-limit usage, mode-scoped suggestions) | ✅ |
| Internships module — workspace (placement summary, progress, task start/submit + dialog, check-ins + composer), payment page (bank detail + upload proof, confirmed strip, empty state), dashboard + banner tiles (self-gating) | ✅ |
| Tech Scholarship module — `TechScholarshipCard` (tier/track/cohort + SIWES coupon), `ShareMilestoneDialog` (banner + regenerate + caption + optional photo + WhatsApp/X + copy caption) | ✅ |
| Oreo module — `api/markdown.ts` safe-subset parser + `AnswerMarkdown`, `OreoPageContent` (suggestion chips per mode, transcript, pending bubble, "How I got this" collapsible, usage meter, New chat) | ✅ |
| Help module — mode-filtered library, category grouping, native `<video>` cards (no iframes), document/link CTAs | ✅ |
| Branding module — `useBranding`/fallback, shell `Logo` swaps to runtime branding | ✅ |
| Wire-up — `/internships`, `/internships/me/payment`, `/oreo`, `/help` routes; dashboard tiles + Help nav entry (`COMMON_NAV_ITEMS`) | ✅ |
| Tests — internship normalise + `computeProgress`, help grouping, markdown matrix (headings/tables/lists/fences/links incl. http(s)-only), canned oreo (determinism, fallback, usage, no-HTML) | ✅ |
| ADR — 0012 Oreo-as-seam (+ scholarship server-derived gate + branding fallback notes); README indexed | ✅ |
| Verify: typecheck / lint / tests / build + §7 walkthrough | ✅ QA'd (`agent-browser`) |

---

## Plan 006 — Assignments ✅

**Status: BUILT & VERIFIED** — completed 2026-09.

**Notes:** Full student assignment surface delivered. Reuses `normaliseAssignment` taproot from `modules/learning`. Supports submission lifecycle (file upload, URL link, inline text), versioning, resubmission (`v1 → v2` history tracking), grade cards with rubric criteria, deadline countdown badges (`CountdownToDeadline`), and list filtering by status.

| Deliverable | Status |
|---|---|
| Mock database — enriched assignment & submission fixtures (`asgn_1` graded w/ rubric, `asgn_2` submitted URL, overdue assignments) | ✅ |
| Mock router — added `/lms/submissions/student`, `/lms/submissions/:assignmentId/mine`, `POST /lms/submissions`, `PUT /lms/submissions/:id/resubmit`, `POST /lms/uploads/assignment` | ✅ |
| `modules/assignments/types/` — UI types + wire shapes | ✅ |
| `modules/assignments/api/` — service, queries (`useMyAssignments`, `useAssignmentDetail`, `useSubmitAssignment`, `useResubmitAssignment`, `useUploadAssignmentFile`), normaliser (`normaliseSubmission`) | ✅ |
| Components — `CountdownToDeadline`, `SubmissionStatusCard`, `SubmissionForm`, `SubmissionHistory`, `GradeCard`, `AssignmentListCard`, `AssignmentPageContent`, `AssignmentListPageContent` | ✅ |
| Routes — `/assignments` (list + filter tabs), `/assignments/[id]` (detail composition) | ✅ |
| Tests — `tests/assignments/normalise-and-countdown.test.ts` + `tests/assignments/submission-lifecycle.test.ts` | ✅ |
| Verify: typecheck / lint / **91 tests pass** / build (30 routes) | ✅ |

---

## Plan 007 — Calendar + Activity + Webinars ✅

**Status: BUILT & VERIFIED** — completed 2026-09.

**Notes:** Three read-oriented surfaces delivered. Calendar includes Month grid (6×7), Week grid (data-driven hour bands), Day view, Agenda timeline, Course filter chips, and `EventDetailDialog`. Activity feed includes group-by-day actions, action icons, and pagination. Webinars module includes Upcoming/Past tabs, live join vs recording watch links, and `DashboardWebinarsWidget`.

| Deliverable | Status |
|---|---|
| Mock database & router — seeded calendar events across scopes, activity history events, and webinars list w/ filtering & pagination | ✅ `7df421d` |
| `modules/calendar/` — types, `grid-utils` math, `normaliseEvent` taproot, service, queries (`useStudentCalendar`, `useUpcomingEvents`) | ✅ `b4632d1` |
| Calendar components — `MonthGrid`, `WeekGrid`, `DayView`, `CourseFilterChips`, `EventDetailDialog`, `CalendarPageContent`, `DashboardCalendarCard`, `UpcomingDeadlinesPanel` | ✅ `265ac37` |
| `modules/activity/` — types, service, queries, `MyActivityPageContent` feed component w/ pagination | ✅ `1554535` |
| `modules/webinars/` — `WebinarCard`, `WebinarsPageContent`, `DashboardWebinarsWidget` | ✅ `9ec2a68` |
| Routes & Dashboard — `/calendar`, `/activity`, `/webinars` pages, dashboard grid layout | ✅ `ae4d8eb` |
| Tests — `tests/calendar/grid-utils.test.ts`, `tests/calendar/normalise.test.ts`, `tests/webinars/webinar-status.test.ts` (101 total tests passing) | ✅ `ae4d8eb` |
| Verify: typecheck / lint / **101 tests pass** / build (30 routes) | ✅ |

---

## Plan 008 — Messaging + Inbox + Notifications ✅

**Status: BUILT & VERIFIED** — completed 2026-09.

**Notes:** Three conversational & realtime-seam surfaces delivered. Inbox lists conversations across 5 types (*Direct*, *Group*, *Assignments*, *Announcements*, *Support*) with unread badges and assignment chips. Thread view (`AssignmentThread`) renders message bubbles (`mine` vs peer) with optimistic text composer & socket event listener. Notifications module provides topbar `NotificationBell` with live unread count badge + popover dropdown feed, and dedicated `/notifications` page with mark-all-read.

| Deliverable | Status |
|---|---|
| Mock database & router — conversations of 5 types, messages history, notifications list w/ mark-read & mark-all-read | ✅ `a1fa42b` |
| `modules/conversations/` — types, `normaliseConversation` taproot, service, queries, `ConversationListItemRow`, `InboxPageContent` | ✅ `c3a4554` |
| `modules/messaging/` — types, `normaliseMessage` (`mine` flag computation), service, queries (`useThread`, `useSendMessage`), `MessageBubble`, `AssignmentThread` | ✅ `c3a4554` |
| `modules/notifications/` — types, `normaliseNotification`, service, queries (`useNotifications`, `useUnreadCount`, `useMarkRead`, `useMarkAllRead`), `NotificationBell`, `NotificationsPageContent` | ✅ `3199cc9` |
| Components & Chrome — `Popover` base-vega primitive, `NotificationBell` mounted in `TopBar`, routes `/inbox` & `/notifications` | ✅ `356e011` |
| Tests — `tests/conversations/normalise.test.ts`, `tests/messaging/normalise.test.ts`, `tests/notifications/normalise.test.ts` (106 total tests passing) | ✅ `356e011` |
| Verify: typecheck / lint / **106 tests pass** / build (30 routes) | ✅ |

---

## Plan 011 — Teaching / Instructor CRUD ✅

**Status: BUILT & VERIFIED** — completed 2026-09.

**Notes:** Full instructor teaching workspace delivered. `/teach` groups assigned cohorts by course banner into Active vs Past tabs using pure `groupCohortsByCourse` and `isCohortEnded` date helpers. `/teach/cohorts/[scheduleId]` renders a 6-tab workspace shell (*Overview*, *Modules*, *Assignments*, *Submissions*, *Sessions*, *Roster*). Instructors can grade/score student work via `GradingDialog` (previewing file/url/text submissions), toggle assignment visibility & due dates, view student attendance records in `StudentAttendanceSheet`, and mark per-session class attendance on `/teaching/sessions/[id]`.

| Deliverable | Status |
|---|---|
| Mock database & router — teaching cohorts across active/past states, rosters, assignment attachments, grading submissions, and attendance sessions/history | ✅ `4d13b7f` |
| `modules/teaching/` — types, `normaliseCohort` / `normaliseCohortDetail`, pure `groupCohortsByCourse` & `isCohortEnded` date helpers, `teachingService`, `attendanceService`, query/mutation hooks | ✅ `65de4ee` |
| Teaching Components — `TeachPageContent`, `CourseCard`, `CohortCard`, `CohortDetailPageContent` (6-tab workspace), `GradingDialog`, `ClassSessionAttendancePage`, `StudentAttendanceSheet` | ✅ `b0787e7` |
| Routes & Components — `Switch` base-vega primitive, `/teach`, `/teach/cohorts/[scheduleId]`, `/teaching/sessions/[id]` | ✅ `d62d5f4` |
| Tests — `tests/teaching/group-cohorts.test.ts`, `tests/teaching/normalise.test.ts` (**111 total tests passing**) | ✅ `d62d5f4` |
| Verify: typecheck / lint / **111 tests pass** / build (30 routes) | ✅ |

---

## Future plans (deferred, in delivery order)

| Plan | Focus | Status |
|---|---|---|
| 006 | Assignments | ✅ built + verified |
| 007 | Calendar / activity / webinars | ✅ built + verified |
| 008 | Messaging / inbox / notifications | ✅ built + verified |
| 010 | Programs & AI help (Oreo) | ✅ built + QA'd (agent-browser walkthrough) |
| 011 | Teaching / instructor CRUD | ✅ built + verified |
| 012 | Auth & API swap (final — real auth + axios adapter) | 🚫 not started |

---

## Cross-cutting conventions (from AGENTS.md)

- Work **one plan at a time**; a plan is confirmed by the user before code.
- **Never assume; confirm scope** — ask before starting a slice, flag ambiguities.
- **Commit incrementally** — small logical units, per deliverable, not one lump.
- Use **shadcn** primitives (via MCP); rebuild on `base-vega`; no old theme.
- Run `npm run typecheck` + `npm run lint` (+ build when feasible) before claiming done.
