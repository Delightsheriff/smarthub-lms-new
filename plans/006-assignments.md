# PLAN 006 — Assignments

**Status:** Draft (awaiting confirmation)
**Owner:** SmartHub port
**Depends on:** 001 (Foundation — wire types, mock database, seam), 005 (Courses + Learning — for `normaliseAssignment` taproot re-use + course-scoped assignment route)

---

## 1. Goal

Deliver the **flat Assignments surface** for the seeded student: a list of
their assignments (with status + due date), an assignment **detail** page
(instructions + resource link + grade card if graded + submission history),
and the **submission flow** — submit / resubmit (text, file, or URL) as a
mutation against the mock database. Unified handling of an assignment's
submission lives here so the course-scoped variant (Plan 005) and the
instructor grading UI (Plan 011) can reuse the same components and normalisers.

## 2. Scope

### In scope
- **`modules/assignments/types/`** — `index.ts` UI types:
  `AssignmentStatus`, `SubmissionStatus`, `Assignment`, `Submission`,
  `SubmissionRubricScore`, `SubmissionHistoryEntry` (see §4).
- **`modules/assignments/api/`** — service + queries + normaliser. The
  normaliser **reuses the learning `normaliseAssignment` taproot** for the
  assignment side and adds a new **submission normaliser** (`normaliseSubmission`).
- **Mock (extend `lib/api/mock/`)** — seed assignment + submission fixtures for
  the enrolled modules; add **submit/resubmit mutation handlers** through the
  API-client seam (create/update a submission, version it, stamp history).
- **List page** `/assignments` — table/cards of the student's assignments:
  title, module, due date, points, status badge, overdue flag.
- **Detail page** `/assignments/[id]` — instructions, description, resource
  `links`, deadline **countdown**, current **submission status card**, the
  **submission form** (submit/resubmit: file / text / URL), **submission
  history** (accordion), and a **grade card** when the submission is graded.
- **Reusable components** (module-owned, not route-coupplied):
  `CountdownToDeadline`, `SubmissionStatusCard`, `SubmissionForm`,
  `SubmissionHistory`, `GradeCard`.
- **Tests** — submit/resubmit mutation handler against the mock; pure
  normaliser + countdown tests.

### Out of scope (explicitly deferred)
- **Instructor grading UI** (grade entry, rubric scoring UI, feedback
  authoring) — Plan 011 (Teaching). Here we only *render* a grade card from an
  already-graded submission and surface the API handlers.
- **Course-scoped assignment route** `courses/.../assignments/[id]` — handled
  in Plan 005; this plan ships the shared components it consumes.
- Auth gating beyond the existing shell.
- Real file upload / Cloudinary — the mock returns a fake URL (see §6.5).

## 3. Source reference

Legacy (`~/Documents/smarthub/smarthub-core-lms/src/`):

- `modules/assignments/` — the module being ported:
  - `types/api.types.ts`, `types/index.ts` — wire + UI assignment/submission shapes.
  - `api/` — service, queries, normalise (`normaliseAssignment`, submission mapping).
  - `config/endpoints.ts` — assignment/submission endpoint path constants.
  - `components/countdown-to-deadline.tsx`, `grade-card.tsx`,
    `submission-form.tsx`, `submission-history.tsx`, `submission-status-card.tsx`.
- `modules/learning/types/api.types.ts` — shared `ApiAssignment` the
  assignments module leans on.

> Reference only for behavior/contracts/types — re-author all components with
> the `base-vega` shadcn preset. Do not copy old tokens/Radix/Tailwind-v3.

## 4. Target files / structure

```
lib/api/mock/                 (extend — see §6 step 3)
  mockDatabase.ts             (assignments + submissions fixtures)
  index.ts                    (submit/resubmit mutation handlers)
modules/assignments/
  api/
    assignments.service.ts    (verb-shaped calls; only place touching the seam)
    assignments.queries.ts    (TanStack hooks: list, detail, submit → splice)
    normalise.ts              (normaliseAssignment via learning taproot; normaliseSubmission)
  components/
    countdown-to-deadline.tsx
    submission-status-card.tsx
    submission-form.tsx
    submission-history.tsx
    grade-card.tsx
    assignment-list-card.tsx
    assignment-page-content.tsx   (detail composition)
  config/endpoints.ts
  types/
    api.types.ts              (submission wire shapes re-export + local)
    index.ts                  (UI shapes, below)
app/
  assignments/
    page.tsx                  (thin → list content)
    [id]/page.tsx             (thin → assignment-page-content)
```

### UI type shapes (`modules/assignments/types/index.ts`)

Reflect the legacy `types/index.ts` + shared learning `ApiAssignment`. UI
types are small; wire/UI mapped in `normalise.ts`.

```ts
export type AssignmentStatus = 'draft' | 'submitted' | 'graded' | 'overdue' | 'returned';

export type Assignment = {
  id: string;
  title: string;
  instructions: string;
  description?: string;
  assignmentLink?: string;
  links: ContentLink[];
  dueAt: string;                 // ISO
  allowLateSubmission: boolean;
  totalPoints: number;
  status: AssignmentStatus;
  grade?: { score: number; totalPoints: number; percentage: number; letterGrade: string };
  type: 'assignment' | 'test' | 'module-project' | 'course-project';
  priority?: string;
};

export type SubmissionStatus = 'submitted' | 'graded' | 'returned' | 'resubmitted';

export type SubmissionRubricScore = {
  criterion: string;
  score: number;
  maxScore: number;
  comment?: string;
};

export type SubmissionHistoryEntry = {
  version: number;
  status: SubmissionStatus;
  submittedAt: string;
  content?: string;
  notes?: string;
  isLateSubmission: boolean;
};

export type Submission = {
  id: string;
  assignmentId: string;
  userId: string;
  submissionType: 'file' | 'text' | 'url';
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  externalUrl?: string;
  notes?: string;
  status: SubmissionStatus;
  submittedAt: string;
  isLateSubmission: boolean;
  version: number;
  previousVersionId?: string;
  history?: SubmissionHistoryEntry[];
  grade?: { score: number; totalPoints: number; percentage: number; letterGrade: string; rubricScores?: SubmissionRubricScore[] };
  feedback?: { general?: string; audioFeedbackUrl?: string; videoFeedbackUrl?: string };
  gradedAt?: string;
  gradedBy?: string;
};
```

`ContentLink` / `toContentLinks` come from `types/content-link.ts` (Foundation).

### Wire shapes (in `lib/api/types.ts` / module `api.types.ts`)

From learning `ApiAssignment` + assignments `ApiSubmission`:

```ts
export type ApiAssignment = {
  _id: string;
  title: string;
  description?: string;
  instructions: string;
  assignmentLink?: string;
  links: ContentLink[];
  type: 'assignment' | 'test' | 'module-project' | 'course-project';
  priority?: string;
  dueDate: string;
  totalPoints: number;
  allowLateSubmission: boolean;
  status: 'draft' | 'submitted' | 'graded' | 'overdue' | 'returned';
  module: string;     // id
  course: string;     // id
};

export type ApiSubmissionRubricScore = {
  criterion: string;
  score: number;
  maxScore: number;
  comment?: string;
};

export type ApiSubmission = {
  _id: string;
  assignment: string;                    // id
  user: string;                          // id
  course?: string;
  module?: string;
  submissionType: 'file' | 'text' | 'url';
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  externalUrl?: string;
  attachments?: ContentLink[];
  notes?: string;
  status: 'submitted' | 'graded' | 'returned' | 'resubmitted';
  submittedAt: string;
  isLateSubmission: boolean;
  version: number;
  previousVersionId?: string;
  submissionHistory?: ApiSubmissionHistoryEntry[];
  grade?: { score: number; totalPoints: number; percentage: number; letterGrade: string; rubricScores?: ApiSubmissionRubricScore[] };
  feedback?: { general?: string; audioFeedbackUrl?: string; videoFeedbackUrl?: string };
  gradedAt?: string;
  gradedBy?: string;
};

export type ApiUploadResponse = { url: string; fileName: string; fileSize: number; mimeType: string };
```

## 5. shadcn components to use (via MCP)

- `card` — list cards / detail panel / grade card
- `button` — submit / resubmit / cancel
- `badge` — status (`draft|submitted|graded|overdue|returned`), late flag
- `separator` — detail layout rhythm
- `countdown` — deadline countdown (verify registry has it; else build thin wrapper on a timer)
- `accordion` — submission history expansion
- `textarea` — text submission + notes
- `input` — external URL
- `select` — submission type (file / text / url)
- `dialog` (or `sheet`) — composed submit flow
- `skeleton` — list/detail loading states
- `alert` — deadline-passed / late-submission warning

> `dialog`/`sheet`, `select`, `countdown`, `skeleton`, `accordion` must be
> fetched from the base-vega registry via the shadcn MCP; do not hand-roll.

## 6. Steps

1. (Foundation/005 already done) Confirm `ApiAssignment` lives in learning
   wire types and `normaliseAssignment` is exposed for reuse.
2. Port **types**: `modules/assignments/types/api.types.ts` (submission wire
   shapes; re-export `ApiAssignment`) + `types/index.ts` (UI shapes in §4).
3. **Mock** (in `lib/api/mock/`):
   - Seed assignments across the enrolled courses/modules with real due dates
     and statuses (≥1 draft/overdue, ≥1 submitted, ≥1 graded).
   - Seed submissions for the seeded student: one graded (with grade +
     feedback + history), one submitted, one draft/none.
   - Add mutation handlers: `createSubmission` (first submit), `resubmitSubmission`
     (new version + history entry + `previousVersionId`), returning the updated
     `ApiSubmission` through the API-client seam. Include a fake-URL upload
     handler (`ApiUploadResponse`).
4. Port **endpoints + service + queries**: `config/endpoints.ts` path
   constants; `assignments.service.ts` (list, get, submit, resubmit, upload);
   `assignments.queries.ts` (TanStack hooks; submit invalidates detail/list
   and optimistically splices status → submitted/resubmitted).
5. Port **normalise.ts**: reuse learning `normaliseAssignment` (lean on the
   taproot for `assignmentId`→`Assignment` with `dueAt` mapped from
   `dueDate`, status derived), add `normaliseSubmission` (wire→UI, maps
   `previousVersionId`, `history`, grade/feedback).
6. Build **components** (base-vega):
   - `CountdownToDeadline` — pure date logic → formatted time-left (or
     "Past due").
   - `SubmissionStatusCard` — current status badge + late flag + version.
   - `SubmissionForm` — type select (file/text/url) + matching input; calls
     the submit mutation; used in a `dialog`.
   - `SubmissionHistory` — `accordion` of `history` entries (version, date,
     status).
   - `GradeCard` — only when `status === 'graded'`: score/total, percentage,
     letter grade, general feedback, rubric scores.
   - `AssignmentListCard` — title/module/due/countdown/status/points.
   - `AssignmentPageContent` — detail composition (instructions, links,
     deadline, status card, form, history, grade card).
7. Wire **routes**:
   - `app/assignments/page.tsx` → list (thin).
   - `app/assignments/[id]/page.tsx` → `AssignmentPageContent` (thin).
   - Add `/assignments` to nav data (`configs/nav.ts`) if not already present.
8. **Tests**: mock submit/resubmit handler (create → version bump → history
   entry → resubmit updates), `normaliseSubmission` pure mapping, countdown
   pure-date cases (future/past/late).
9. Verify typecheck, lint, build, dev-boot + manual flows (see §7).

## 6.5 Architecture brief (see `ARCHITECTURE.md`)

1. **Deepen** — the deletion test: the countdown is a genuinely small deep
   util (pure date logic, reused by list + detail + course page). The real
   depth is the **submission lifecycle** — versioning, history stamping, late
   detection, status transition — which lives behind the **normaliser +
   mutation seam**, concentrated in `normalise.ts` + the mock handlers, not
   spread across components. `normaliseAssignment` reuses the learning
   **taproot** (huge locality win; not re-implemented per caller).
2. **Seams** — two real seams: (a) the **API-client data-source seam** —
   submission reads AND writes go through it (submit/resubmit/upload mutations
   handled by the mock adapter now, real axios at Plan 012); (b) the
   **upload/file-storage seam** — the mock returns a fake `ApiUploadResponse`
   URL, slotting the future Cloudinary adapter behind the same interface.
   Both are separate small seams; do not over-abstract.
3. **Testability** — normalisers are **pure** (`wire → UI`), so
   `normaliseSubmission` and the countdown date logic are unit-testable with
   no DOM. The submit/resubmit **mutation handlers run inside the mock** —
   test the full create→version→history lifecycle through the seam without
   axios. Components stay thin and duck behind the query/mutation hooks.
4. **ADR** — record one decision: **submission mutations live behind the same
   API-client seam as reads** (submit/resubmit/upload are normalised
   mutations against the mock, not ad-hoc component logic), so the Plan 012
   API swap moves them wholesale with one adapter.

## 7. Acceptance checks

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run dev` boots; no console errors on assignments routes
- [ ] `/assignments` lists seeded assignments with **status badges + due dates**
      (draft/overdue, submitted, graded all represented)
- [ ] `/assignments/[id]` shows **instructions + `assignmentLink`/resource
      links** + deadline countdown
- [ ] Submitting (text/file/URL) **creates a submission in the mock**; status
      flips to `submitted`; resubmitting **bumps version + appends a history
      entry** with `previousVersionId`
- [ ] A **graded** submission shows the **grade card** (score/points/
      percentage/letter) + general feedback + rubric scores + history
- [ ] Late submission surfaces the **late** flag; past-due assignment renders
      the alert
- [ ] New tests pass: mock submit/resubmit lifecycle, `normaliseSubmission`,
      countdown date logic
- [ ] Architecture brief satisfied (taproot reuse, mutations behind seam, ADR
      recorded)

## 8. Open questions / to confirm

- `countdown` component — is it available in the base-vega registry, or do we
  pull a timer hook and build a thin wrapper? (Recommend: build the small
  pure-date util + thin component; registry is canonical if present.)
- Assignment **priority** — legacy has a `priority` field; should it render as
  a badge/sort or be carried silently for now? Confirm.
- Should the flat `/assignments` list be **cards or a table**? (Recommend
  cards for mobile-first; table is heavier and likely unnecessary.)
- Late-flag basis — compute `isLateSubmission` from `submittedAt > dueAt` at
  render, or trust the wire field? (Recommend trust the wire field; mock
  computes it.)
- Reuse scope: does Plan 005's course-scoped assignment route import these
  components, or duplicate the page shell? (Recommend: centralise components
  here; 005 composes.)
