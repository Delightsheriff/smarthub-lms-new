# PLAN 011 — Teaching Instructor CRUD

**Status:** Draft (awaiting confirmation)
**Owner:** SmartHub port
**Depends on:** 001 (Foundation — wire types, mock database, seam, enums), 005 (Courses + Learning — `normaliseAssignment` taproot + module/course fixtures the attach pickers lean on), 006 (Assignments — submission wire shapes + `normaliseSubmission` seam + Mock upload handler reused by the grading surface), 007 (Calendar — the class-session feed `CohortSessionsTab` consumes), 008 (Messaging/Inbox — the dashboard inbox tile that surfaces `InboxRow`s from this same normaliser)

---

## 1. Goal

Deliver the **instructor Teaching surface** — the largest module in the port. Two mains parts:

1. **Cohort list + detail** — a `/teach` page grouping the instructor's cohorts by course, and a per-cohort workspace with six tabs (Overview / Modules / Assignments / Submissions / Sessions / Students), all driven by the wire-faithful mock.
2. **Interaction mutations** (cohort CRUD-lite) — the instructor **attaches existing** assignments/recordings/materials, **edits per-cohort due dates** and attachment visibility, **marks attendance** against class sessions, and **grades/returns submissions** via the GradingDialog. Instructors never create courses — they assemble and tune teaching content for the cohorts they teach.

Everything is **UI-first against the mock** behind the API-client seam; the Plan 012 API swap moves the same queries/mutations wholesale.

## 2. Scope

### In scope
- **`modules/teaching/types/`** — `api.types.ts` (`ApiTeachingCohort`, `ApiTeachingCohortDetail`), `types/index.ts` (all UI aggregate shapes), `types/attendance.ts` (session attendance + per-student history), plus the local aggregate **wire** shapes the service maps (in `api/teaching.service.ts`, mirroring the source's `ApiCohortRosterRow`… `ApiInboxRow`).
- **`modules/teaching/api/`** — service (reads + mutations through the seam), queries (TanStack hooks + keys + optimistic updates), normalise (pure wire→UI, **the heaviest normalisers**), and the separate attendance service + queries.
- **`modules/teaching/lib/group-cohorts.ts`** — pure `groupCohortsByCourse` / `isCohortEnded` course-grouping helper.
- **`modules/teaching/config/endpoints.ts`** — teaching + attendance endpoint path constants.
- **Mock (extend `lib/api/mock/`)** — seed teaching cohorts (a few, in different `COHORT_STATUS`es with module-density counts), per-cohort rosters (`lastSubmittedAt`), assignment attachments (`AssignmentScheduleAttachment` + submission rollups), submissions (with `content` for the grading preview), attendance sessions + rows + per-student history, the module library (`ModuleAssignmentRow` for attach pickers), and multi-cohort instructor assignment rows. **Mutation handlers** through the seam: edit due date, toggle visibility, attach/detach assignment/recording, mark attendance, grade/return a submission.
- **Pages/routes** — `(app)/teach` (list), `(app)/teach/cohorts/[scheduleId]` (detail + tabs), plus the attendance routes (`teaching/sessions/[id]`) and the Tasks/Inbox instructor surfaces.
- **Components** — the full teaching component set (list below in §4).
- **Tests** — pure rollup normalisers (they compute counts), `groupCohortsByCourse`, the mock attendance mark handler, and multi-cohort picker logic.

### Out of scope (explicitly deferred)
- **Instructor pay / earnings** — Plan 009.
- **Student-facing course detail/edit**, ads creation of courses — Plan 005.
- **Assignments student submission flow** — Plan 006 (this plan only *grades* submissions the mock seeded).
- **Notifications/inbox for students** — Plan 008 (this plan reuses its `InboxRow` normaliser for the instructor inbox tile).
- **Real Cloudinary uploads / Slack posts** — the mock returns fake URLs and stubs `notifySlack` as a no-op.
- **Auth gating beyond the existing shell** — instructors are a seeded role in the mock (Plan 001/003).
- Re-theming the new design tokens to the old brand; hand-rolled primitives (use shadcn base-vega).

## 3. Source reference

Legacy (`~/Documents/smarthub/smarthub-core-lms/src/modules/teaching/`):

- `types/` — `api.types.ts`, `index.ts`, `attendance.ts` (mirrored into target types).
- `api/` — `teaching.service.ts` (aggregate wire shapes + grade/attach payloads), `teaching.queries.ts` (keys, mutation + optimistic invalidation), `normalise.ts` (rollup normalisers), `attendance.service.ts`, `attendance.queries.ts`, `upload.ts`.
- `lib/group-cohorts.ts` — course grouping helper.
- `config/endpoints.ts` — teaching + attendance paths.
- `components/*` — the whole list: `TeachPageContent`, `CohortCard`, `CourseCard`, `CohortSwitcher`, `CohortDetailPageContent`, `CohortOverviewTab`, `CohortModulesTab`, `CohortAssignmentsTab`, `CohortSubmissionsTab`, `CohortRosterTab`, `CohortSessionsTab`, `CohortAssignmentDetail`, `CohortModulePageContent`, `CohortMaterialDetail`, `CohortRecordingDetail`, `GradingDialog`, `SubmissionList`, `InstructorAssignmentsList`, `ClassSessionAttendancePage`, `StudentAttendanceSheet`, `EditCohortDueDateDialog`, `EditCohortAssignmentScheduleDialog`, `CreateAssignmentMultiCohort`, `AttachExistingAssignmentDialog`, `AttachExistingRecordingDialog`, `AssignmentForm`, `MaterialForm`, `RecordingForm`, `NeedsGradingStrip`, `RecentSubmissionsTile`, `UpcomingClassesTile` (the last four dashboard tiles compose from teaching data).
- Routes: `(app)/teach/page.tsx`, `teach/cohorts/[id]/{page,layout}.tsx` + `assignments|materials|recordings|modules` sub-pages, `teach/assignments/new/page.tsx`, `teaching/sessions/[id]/page.tsx`.

Backend contract (`~/Documents/smarthub/smarthub-api/src/`): `constants/index.ts` (`INSTRUCTOR_ROLES`, `ATTENDANCE_STATUS`, `ATTENDANCE_SOURCE`, `COHORT_STATUS`), and the models mirroring teaching/attendance wire shapes.

> Reference only for behavior/contracts/types — re-author all components with the `base-vega` shadcn preset. Do not copy old tokens/Radix/Tailwind-v3.

## 4. Target files / structure

```
lib/api/mock/                    (extend — see §6 step 3)
  mockDatabase.ts                (teaching cohorts, rosters, attachments,
                                  submissions, attendance sessions/rows/history,
                                  module library, instructor aggregates)
  index.ts                       (teaching + attendance mutation handlers
                                  + teaching aggregate reads)
modules/teaching/
  api/
    teaching.service.ts          (verb-shaped reads/mutations + local aggregate
                                  wire types ApiCohortRosterRow … ApiInboxRow)
    teaching.queries.ts          (TEACHING_QUERY_KEYS + hooks + optimistic
                                  module-status + grading invalidation)
    attendance.service.ts        (getSessionAttendance, markSessionAttendance)
    attendance.queries.ts        (useSessionAttendance live-poll, useMarkSessionAttendance)
    normalise.ts                 (normaliseCohort, normaliseCohortDetail,
                                  normaliseRosterRow, normaliseCohortAssignmentRow,
                                  normaliseCohortSubmissionRow, normaliseInboxRow,
                                  normaliseInstructorModule, normaliseInstructorAssignmentRow,
                                  normaliseModuleAssignmentRow, normaliseCohortRecordingRow)
  lib/
    group-cohorts.ts             (isCohortEnded, groupCohortsByCourse)
  components/
    teach-page-content.tsx       (cohort list composition → CourseCard grid)
    cohort-card.tsx
    course-card.tsx
    cohort-switcher.tsx          (dropdown of teachable cohorts)
    cohort-detail-page-content.tsx (header + Tabs shell, deep-link ?tab=&assignment=)
    cohort-overview-tab.tsx      (snapshot + module density + create CTAs)
    cohort-modules-tab.tsx       (module list with per-module status toggle)
    cohort-assignments-tab.tsx   (rollup rows → EditDueDate / Attach dialogs)
    cohort-submissions-tab.tsx   (filterable list → GradingDialog)
    cohort-roster-tab.tsx        (roster table → per-student attendance sheet)
    cohort-sessions-tab.tsx      (calendar-feed class-session list → /teaching/sessions)
    submission-list.tsx          (shared table of CohortSubmissionRow / InboxRow → GradingDialog)
    grading-dialog.tsx           (shared: score + feedback, submission preview)
    student-attendance-sheet.tsx (per-student history drill-down)
    class-session-attendance-page.tsx (mark attendance per session)
    instructor-assignments-list.tsx   (Tasks-page aggregate rows)
    create-assignment-multi-cohort.tsx (module picker → attach to N cohorts)
    attach-existing-assignment-dialog.tsx
    attach-existing-recording-dialog.tsx
    edit-cohort-due-date-dialog.tsx
    edit-cohort-assignment-schedule-dialog.tsx
    assignment-form.tsx / material-form.tsx / recording-form.tsx
    needs-grading-strip.tsx / recent-submissions-tile.tsx / upcoming-classes-tile.tsx
  config/
    endpoints.ts                 (COHORTS, COHORT_DETAIL, roster, submissions,
                                  assignments, recordings, modules, inbox,
                                  MY_ASSIGNMENTS/MY_MODULES, grade, attach/detach…)
  types/
    api.types.ts                 (ApiTeachingCohort, ApiTeachingCohortDetail)
    attendance.ts                (AttendanceStatus/Source, SessionAttendance*,
                                  MarkAttendance*, StudentAttendance*)
    index.ts                     (UI shapes, below)
app/
  (app)/
    teach/
      page.tsx                   (thin → TeachPageContent)
      cohorts/[scheduleId]/page.tsx   (thin → CohortDetailPageContent)
      cohorts/[scheduleId]/assignments/new/page.tsx
      cohorts/[scheduleId]/assignments/[assignmentId]/{page,edit}/page.tsx
      cohorts/[scheduleId]/recordings/[recordingId]/{page,edit}/page.tsx
      cohorts/[scheduleId]/materials/[materialId]/{page,edit}/page.tsx
      cohorts/[scheduleId]/modules/[moduleSlug]/page.tsx
      assignments/new/page.tsx      (CreateAssignmentMultiCohort)
    teaching/sessions/[id]/page.tsx (thin → ClassSessionAttendancePage)
```

### UI type shapes (`modules/teaching/types/index.ts`)

Exact UI surfaces, with the wire → UI mapping done in `normalise.ts`:

```ts
export interface TeachingCohort {
  id: string;
  startDate: string;
  endDate?: string;
  duration?: string;
  studentCount: number;
  progress: number;                 // 0–100, duration-weighted
  course: { id: string; name: string; slug?: string; mode?: string;
            imageUrl?: string; description?: string };
}

export interface TeachingModule {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  learningObjectives?: string[];
  estimatedDuration?: string;
  order?: number;
  assignmentCount?: number;   // per-module density chips
  recordingCount?: number;
  materialCount?: number;
}

export interface TeachingCohortDetail extends TeachingCohort {
  modules: TeachingModule[];
}

export interface CohortRosterRow {
  studentId: string;
  name: string;
  email?: string;
  lastSubmittedAt: string | null;
  submissionCount: number;
}

export interface CohortAssignmentRow {
  attachmentId: string;      // AssignmentSchedule._id (join row)
  assignmentId: string;
  title: string;
  description?: string;
  module?: string;
  dueDate?: string;
  allowLateSubmission?: boolean;
  isVisible?: boolean;
  totalPoints?: number;
  submissionCount: number;
  gradedCount: number;
  pendingCount: number;
  lateCount: number;
}

export interface AssignmentScheduleAttachment {
  id: string;
  scheduleId: string;
  courseId?: string;
  courseName?: string;
  startDate?: string;
  duration?: string;
  price?: number;
  isVisible: boolean;
  dueDate?: string;
  allowLateSubmission: boolean;
}

export interface CohortSubmissionRow {
  id: string;
  assignment: { id: string; title: string; totalPoints?: number };
  student: { id: string; name: string; email?: string };
  submittedAt?: string;
  status?: string;
  isLate: boolean;
  score?: number;
  fileUrl?: string;
  externalUrl?: string;
  submissionType?: "file" | "text" | "url";
  fileName?: string;
  fileMimeType?: string;
  content?: string;            // feeds GradingDialog preview
}

export interface InstructorModuleCohort {
  scheduleId: string;
  scheduleName?: string;
  courseId: string;
  courseName?: string;
  startDate?: string;
}

export interface InstructorModule {
  id: string;
  title: string;
  slug?: string;
  cohorts: InstructorModuleCohort[];
}

export interface InstructorAssignmentRow extends CohortAssignmentRow {
  schedule: { id: string; name?: string };
  course: { id: string; name: string; slug?: string };
}

export interface InboxRow {
  id: string;
  assignment: { id: string; title: string; totalPoints?: number };
  cohort: { id: string; courseName?: string; startDate?: string };
  student: { id: string; name: string; email?: string };
  submittedAt?: string;
  isLate: boolean;
  score?: number;
  status?: string;
  submissionType?: "file" | "text" | "url";
  fileUrl?: string;
  fileName?: string;
  fileMimeType?: string;
  externalUrl?: string;
  content?: string;
}

export interface ModuleAssignmentRow {
  assignmentId: string;
  title: string;
  description?: string;
  totalPoints?: number;
  allowLateSubmission?: boolean;
  isPublished?: boolean;
  attachedScheduleIds: string[];
}

export interface CohortRecordingRow {
  recordingId: string;
  isVisible: boolean;
}

export type { ApiTeachingCohort, ApiTeachingCohortDetail } from "./api.types";
```

### Wire shapes (`modules/teaching/types/api.types.ts`)

```ts
export interface ApiTeachingCohort {
  _id: string;
  startDate: string;
  endDate?: string;
  duration?: string;
  applicationIsOpen?: boolean;
  applicationEndDate?: string;
  studentCount: number;
  progress?: number;
  course?: { _id: string; name: string; nameSlug?: string; mode?: string;
             imageUrl?: string; description?: string };
}

export interface ApiTeachingCohortDetail extends ApiTeachingCohort {
  instructors?: Array<{ _id: string; firstName?: string; lastName?: string }>;
  modules?: Array<{ _id: string; title?: string; titleSlug?: string;
    description?: string; learningObjectives?: string[]; estimatedDuration?: string;
    order?: number; assignmentCount?: number; recordingCount?: number;
    materialCount?: number }>;
}
```

### Attendance wire shapes (`modules/teaching/types/attendance.ts`)

Exact types from the task:

```ts
export type AttendanceStatus = "present" | "late" | "absent" | "excused";

export type AttendanceSource =
  | "meet-report" | "qr-scan" | "terminal-pin" | "instructor" | "admin";

export interface SessionAttendanceMeta {
  _id: string; scheduleId: string; startsAt: string; durationMinutes: number;
  title: string; location?: string; link?: string; isCancelled?: boolean;
}

export interface SessionAttendanceRow {
  studentId: string; enrollmentId: string; firstName: string; lastName: string;
  email: string; imageUrl?: string;
  status?: AttendanceStatus;               // absent on unmarked rows
  source?: AttendanceSource; durationMinutes?: number; note?: string; markedAt?: string;
}

export interface SessionAttendanceResponse {
  session: SessionAttendanceMeta;
  rows: SessionAttendanceRow[];
}

export interface MarkAttendancePayload {
  marks: Array<{ studentId: string; status: AttendanceStatus; note?: string }>;
}

export interface MarkAttendanceResult { succeeded: number; failed: number; }

export interface StudentAttendanceSessionRow {
  sessionId: string; title?: string; startsAt: string; isCancelled: boolean;
  status: AttendanceStatus | null;        // null = unmarked
  source?: AttendanceSource; durationMinutes?: number; note?: string; markedAt?: string;
}

export interface StudentAttendanceCohortBlock {
  scheduleId: string; courseName?: string; cohortStartDate?: string;
  summary: { held: number; present: number; late: number; absent: number;
             excused: number; unmarked: number; percentage: number };
  sessions: StudentAttendanceSessionRow[];
}

export interface StudentAttendanceHistory {
  student: { userId: string; studentId?: string; firstName?: string;
             lastName?: string; email?: string };
  cohorts: StudentAttendanceCohortBlock[];
}
```

### Enums (mirrored in `lib/api/constants.ts` already per Foundation; the teaching module consumes them)

`INSTRUCTOR_ROLES = ["lead","co-instructor","ta","guest","observer"]`, `ATTENDANCE_STATUS = ["present","late","absent","excused"]`, `ATTENDANCE_SOURCE = ["meet-report","qr-scan","terminal-pin","instructor","admin"]` **(with a display precedence: instructor→admin overrides auto sources; the `sourceCopy` in the attendance page renders "You · time ago" for instructor marks, "Admin · …" for admin, etc.)**, `COHORT_STATUS` (active/upcoming/completed — drives the cohort grouping state).

## 5. shadcn components to use (via MCP)

- `card` — cohort/course cards, details, tiles
- `button` — all actions + create/attach/save CTAs
- `badge` — status, mode, cohort state, submission state, late flag, source pill
- `avatar` — roster / attendance / submission student faces
- `separator` — detail + list rhythm
- `dialog` — GradingDialog, EditDueDate, EditAssignmentSchedule, AttachAssignment/Recording
- `tabs` — cohort detail tab shell (Overview/Modules/Assignments/Submissions/Sessions/Students)
- `select` — submission filters, module/assignment pickers, status filters
- `textarea` — grade feedback + attendance note
- `table` — roster and sessions surfaces
- `dropdown-menu` — row actions (edit due date, detach, view submissions)
- `switch` — per-attachment visibility toggles
- `progress` — cohort delivery progress
- `skeleton` — loading states throughout
- `input` — score in GradingDialog
- (`countdown`/`alert` if reused from Plan 006 where applicable)

> All from the base-vega registry via the shadcn MCP; do not hand-roll primitives.

## 6. Steps

1. **Confirm prerequisites** — teaching wire types/enums already mirrored in Foundation; `normaliseAssignment`/`normaliseSubmission` taproot available from Plans 005/006; class-session calendar feed from 007; `InboxRow` normaliser pattern from 008.
2. **Port teaching types** — `types/api.types.ts`, `types/index.ts` (UI shapes in §4), `types/attendance.ts`.
3. **Mock** (extend `lib/api/mock/`):
   - Seed **teaching cohorts** (a few, across `COHORT_STATUS`es — active/upcoming/completed), each with module **density counts** in `ApiTeachingCohortDetail.modules`.
   - Seed **per-cohort rosters** (`ApiCohortRosterRow` with `lastSubmittedAt`/`submissionCount`) and per-cohort **assignment attachments** (`ApiCohortAssignmentRow` with submission rollups: submission/grade/pending/late counts).
   - Seed **submissions** `ApiCohortSubmissionRow` with `content` (text), plus file/url variants so the GradingDialog preview has all three surface states; a couple already graded (re-grade path), the rest ungraded.
   - Seed **attendance** — `SessionAttendanceResponse` for a past/in-progress class session (rows pre-marked from a mix of sources), plus a per-student `StudentAttendanceHistory` for the roster drill-down.
   - Seed the **module library** (`ApiModuleAssignmentRow` w/ `attachedScheduleIds`) and **instructor aggregates** (`ApiInstructorAssignmentRow`/`ApiInstructorModule` for the Tasks inbox + multi-cohort picker).
   - Add **mutation handlers** behind the seam: `updateAssignmentSchedule` (due date + visibility + late flag), `attachAssignmentToSchedule` / `detachAssignmentFromSchedule`, `attachRecordingToSchedule`, `gradeSubmission`, `markSessionAttendance`, `setCohortModuleStatus`. Each mutates the in-memory records and returns the updated shape (or the `MarkAttendanceResult` / grade ack).
4. **Port endpoints + service + queries** — `config/endpoints.ts`; `teaching.service.ts`; `teaching.queries.ts` (hooks for every read + mutation; grading invalidates cohort submissions, cohort assignments, inbox, and `my-assignments` rollups; module-status is optimistic with rollback); `attendance.service.ts` + `attendance.queries.ts` (`useSessionAttendance` live-polls every 30 s, `useMarkSessionAttendance` invalidates).
5. **Port normalise.ts** — the heavy rollup normalisers above (pure wire→UI). Reuse the assignments/learning taproot where an assignment sub-shape appears.
6. **Port group-cohorts.ts** — `isCohortEnded` (missing/unparseable endDate = running) + `groupCohortsByCourse` (active/past buckets, newest-current-first).
7. **Build components** (base-vega) — the full list in §4, grouped by surface:
   - Cohort **list**: `TeachPageContent`, `CourseCard`, `CohortCard`, `CohortSwitcher`.
   - Cohort **detail shell**: `CohortDetailPageContent` (header card + `Tabs` shell + `?tab=&assignment=` deep-linking).
   - **Tabs**: `CohortOverviewTab`, `CohortModulesTab`, `CohortAssignmentsTab`, `CohortSubmissionsTab`, `CohortRosterTab`, `CohortSessionsTab`.
   - **Grading**: `SubmissionList` (shared table fed by both `CohortSubmissionRow` and `InboxRow`), `GradingDialog` (shared adapter — score input + feedback textarea + submission preview for file/url/text), `InstructorAssignmentsList`, `NeedsGradingStrip`, `RecentSubmissionsTile`.
   - **Mutations**: `EditCohortDueDateDialog`, `EditCohortAssignmentScheduleDialog`, `AttachExistingAssignmentDialog`, `AttachExistingRecordingDialog`, `CreateAssignmentMultiCohort`, `AssignmentForm`, `MaterialForm`, `RecordingForm`, `UpcomingClassesTile`.
   - **Attendance**: `ClassSessionAttendancePage` (pending-diff Map, status segmented control, note textarea, fixed "Save all" bar → `markSessionAttendance`), `StudentAttendanceSheet` (per-student history drill-down).
8. **Wire routes** — the `(app)/teach/*` + `teaching/sessions/[id]` tree in §4; add `teach` (+ nested) to nav data (`configs/nav.ts`) if not already present.
9. **Tests** — mock grade + mark-attendance handlers (persist + return updated state), the pure rollup normalisers (count computation), `groupCohortsByCourse`/`isCohortEnded` date logic, and the multi-cohort attach picker selection semantics.
10. Verify typecheck, lint, build, dev-boot + manual flows (§7).

## 6.5 Architecture brief (see `ARCHITECTURE.md`)

1. **Deepen** — the **deletion test**: the source's teaching module is mostly thin query/service pass-throughs, but the **real complexity concentrates in the instructor aggregate normalisation** (cohort assignment/submission **rollups — they compute `submissionCount/gradedCount/pendingCount/lateCount`**) and in the **GradingDialog + InboxRow shared adapter** (one shape, two surfaces → one submission preview + grading form). Keep teaching as **one deep module**: the rollups and the grading adapter are the depth. `groupCohortsByCourse` + `isCohortEnded` are genuinely small deep utils (pure date/grouping logic with subtle "missing endDate = running" rule) — port them as-inspectable pure helpers, not component-inline.
2. **Seams** — every **grading / attendance / attach-detach / due-date interaction mutation goes behind the API-client seam** (the mock adapter now, real axios at Plan 012) — exactly as in Plans 001/006. `attendance` is its own service + query pair (a real second seam: polls on its own `refetchInterval` and writes independently of the cohort aggregates), mirroring the source. The GradingDialog deliberately reads submission detail from the `submission` prop already present (no extra fetch) so open-dialog is latency-free — two real surfaces cross the same seam.
3. **Testability** — normalisers are **pure** (`wire → UI`) and heavily tested (they compute the rollup counts the whole surface depends on). The **attendance mark handler and grade handler run inside the mock** — test the full mark-persist and grade-persist lifecycle through the seam without axios. Cohort grouping date logic (`isCohortEnded`) is pure-date and unit-testable. Components stay thin, ducking behind the query/mutation hooks.
4. **ADR** — record **instructor aggregate normalisation decisions**: (a) attendance lives in its own service/query pair and polls on its own interval; (b) the GradingDialog + InboxRow/CohortSubmissionRow share a single **submission adapter** so both surfaces render the same preview + grade form; (c) rollup counts are computed **server/mock-side** and normalised, never recomputed in components.

## 7. Acceptance checks

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run dev` boots; no console errors on teach/attendance routes
- [ ] `/teach` lists the instructor's cohorts **grouped by course** (active vs past), with `progress` bars + student counts from the mock
- [ ] `/teach/cohorts/[scheduleId]` renders the **six-tab detail** (Overview / Modules / Assignments / Submissions / Sessions / Students) entirely from the mock
- [ ] Roster tab shows submission state (`lastSubmittedAt`/`submissionCount`); opening a student loads their attendance history
- [ ] Grading dialog opens with the student's **submission content preview** (file/url/text); saving **records the grade in the mock** and rollup counts (graded/pending) refresh
- [ ] Attendance page loads the session `SessionAttendanceResponse`; marking **persists** to the mock and re-renders on refetch; source pills render
- [ ] Edit-due-date / toggle-visibility / attach-detach-assignment / attach-recording mutations **update the mock** and the corresponding list/tab invalidates
- [ ] Multi-cohort assignment create + attach pickers render from the mock module library with `attachedScheduleIds` diffing
- [ ] New tests pass: rollup normalisers, `groupCohortsByCourse`, mock grade + mark-attendance handlers, multi-cohort picker logic
- [ ] Architecture brief satisfied (mutations behind seam, one deep grading/submission adapter, attendance owns its seam, ADR recorded)
- [ ] No `any`; strict TS; no hand-rolled primitives (all shadcn base-vega)

## 8. Open questions / to confirm

- **Route for per-cohort sub-pages** — the source nests assignment/recording/material edit under `teach/cohorts/[id]/…`. Keep that full tree, or consolidate the attach/edit flows into dialogs on the tabs (recommend dialogs for attach/due-date per the task's dialog list, but keep dedicated edit pages for full AssignmentForm/RecordingForm/MaterialForm)? Confirm scope.
- **Sessions tab data source** — reuse the Plan 007 calendar feed (as the source does) vs a bespoke cohort-sessions read. (Recommend reuse; it already merges teaching + enrolment.) Confirm.
- **Attendance route shape** — mirror source (`teaching/sessions/[id]`) vs nest under `teach/…`? (Recommend mirroring the source route for the attendance sheet; keep cohort list/detail under `teach`.)
- **Scope of "CRUD"** — this plan covers **CRUD-lite** (attach existing, edit due date/visibility, mark attendance, grade). The full create-offline assignment form + recording/material forms: include them here, or defer form authors to a follow-up? (Task lists `AssignmentForm`/`MaterialForm`/`RecordingForm` — include; confirm.)
- **Instructor inbox / Tasks surface** — does `InboxRow`/`InstructorAssignmentsList` render on a dedicated `/teach/tasks` page here, or is it composed into the Plan 008 inbox/dashboard? (Recommend: build the lists + GradingDialog here, and let 008 compose.) Confirm.
- **`AssignmentScheduleAttachment`** — used by the multi-cohort/eligible-schedules picker; confirm it renders on the attach dialogs as a secondary (course + cohort name) read, not a separate list page.
