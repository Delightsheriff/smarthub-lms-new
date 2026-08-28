# PLAN 001 — Foundation

**Status:** Built (2026-08)
**Owner:** SmartHub port
**Depends on:** none (starts from the current scaffold)

---

## 1. Goal

Stand up the shared, stack-agnostic infrastructure every module depends on:
the API-layer **data-source seam**, a backend-faithful **`mockDatabase.ts`**
(wire-shaped, typed against the mirrored `smarthub-api` contract), state
stores, utilities, providers, constants and configs. After this slice the
app must still compile, lint and typecheck clean — no screens yet, just the
load-bearing foundation on the **new** stack and the **new** design system.

**Why the seam matters (UI-first strategy):** every later screen and module
consumes the API-client seam. In Foundation we wire that seam to the mock;
at the very end (Plan 012/auth) we swap the adapter behind it for the real
axios client. Normalisers, types, stores and screens stay identical.

---

## 2. Scope

## 2. Scope

### In scope
- Add runtime dependencies (below).
- `lib/utils.ts` — add date/price/text helpers.
- `lib/constants/` — `api.ts` (`LMS_PREFIX`), `storage.ts` (localStorage keys).
- **Backend contract mirror** — `lib/api/types/` (or a `contracts/` folder):
  shared **wire-type** definitions + **enum constants** mirroring
  `smarthub-api/src/constants/index.ts` and its Mongoose sub-docs. This is
  the local single source of truth for what the API returns (see §2.1 for
  the inventory of what to mirror).
- **`lib/api/mock/`** — the **data-source adapter**:
  - `mockDatabase.ts` — **wire-shaped, high-fidelity** in-memory records
    (string ids, nested sub-docs, real enum values) for every surface listed
    in §2.1, seeded with realistic sample users/courses/cohorts so screens
    render meaningfully.
  - `index.ts` — async query/mutation handlers behind the same tiny
    interface the future axios client exposes (so the swap is one adapter).
- `lib/api/` — `client.ts`, `types.ts`, `index.ts` built to the **interface**
  (see §2.1 note): bearer token, single-flight 401 refresh, auto-toasts,
  `silent`, get/getBlob/post/put/patch/delete, `ApiError`. In the UI-first
  phase this client's handlers are **backed by the mock** — the axios wiring
  is stubbed behind the same surface (added fully at Plan 012).
- `lib/socket/socket-provider.tsx` + `useSocket` — in the mock phase this
  reflects realtime events from the mock's in-memory event emitter.
- `lib/` misc helpers: `cloudinary-download`, `image`, `mime-extension`,
  `module-progress`.
- `store/slices/` — `authStore`, `roleModeStore`, `sidebarStore`, `uiStore`
  (ported logic; **auth seeded from mock users**, new persist keys allowed).
- `configs/` — `brand.ts`, `nav.ts` (nav data — rendering comes in Plan 004).
- `hooks/` — `use-page-param`, `use-notification-chime`, `use-title-notifier`.
- `components/providers/` — `app-providers` (theme + query + Toaster),
  `query-provider` wired to the **mock** data source.
- `types/content-link.ts`.
- `types/content-link.ts` re-export of `ContentLink`/`toContentLinks`.
- **`CONTEXT.md`** (repo root) — seed the LMS **domain glossary** (Course,
  Cohort, Schedule, Module, Recording, Material, Assignment, Submission,
  Assessment/Grade, Enrollment, Roster, Attendance, Payment/Installment-Plan,
  Payment-Proof, Scholarship, Internship, Referral, Webinar,
  Conversation/Thread, Notification, Activity, SIWES placement, Acceptance
  Letter). Created lazily; sharpened as modules land.
- **`docs/adr/`** — seed with the foundation decisions already made (module-
  per-domain shape, shared axios client + single-flight refresh,
  normalise-in-query `select`, Zustand + TanStack split, keep the new design
  system, contract source = smarthub-api, **UI-first: mock data-source
  adapter behind the API seam, auth/API last**).
- Verify `globals.css` tokens are the intended new design system (no change
  unless user confirms).

### 2.1 Backend contract to mirror into the mock (authoritative inventory)

Enumerated from `smarthub-api/src/models/*` + `src/constants/index.ts` and
the legacy LMS module type files. The mock must carry **wire-shaped**
samples of the lists **each section below needs**, mirroring these enum
literal sets exactly:

- **Enums (`lib/api/constants`)** — `COHORT_STATUS`, `MODELS` map,
  `ATTENDANCE_STATUS`, `ATTENDANCE_SOURCE`, `CALENDAR_EVENT_TYPE/_SOURCE/
  _SCOPE`, `MODE_OPTION`, `DIFFICULTY`, `COURSE_KIND`, `PAYMENT_STATUS`,
  `PAYMENT_OPTION`, `PAYMENT_PROOF_STATUS/_PURPOSE`, `INSTALLMENT_TYPE`,
  `INSTALLMENT_ENFORCEMENT`, `INSTALLMENT_PLAN_ORIGIN/_TYPE/_STATUS`,
  `INSTALLMENT_STATUS`, `ENROLLMENT_ACCESS_STATUS`, `ENROLLMENT_ROLES`,
  `CONTENT_STATUS`, `MATERIAL_CATEGORY`, `ASSIGNMENT_TYPE`, `SUBMISSION_STATUS`,
  `INVITATION_STATUS`, `INTERNSHIP_APPLICATION_STATUS/_STATUS/_TASK_STATUS`,
  `REFERRAL_RECORD_STATUS`, `PAYOUT_STATUS/_KINDS`, `INSTRUCTOR_PAY_ITEM_STATUS`,
  `EARNING_STREAMS`, `COMPENSATION_MODELS`, `INSTRUCTOR_ROLES`, `PAY_ITEM_KINDS`,
  `SETTLEMENT_MILESTONES`, `CONTACT_MESSAGE_STATUS/_CHANNEL`, `FEEDBACK_TYPE/
  _STATUS`, `ROLES`, `SCHOLARSHIP_TRACKS/_STAGES`.
- **Shared wire types** — `ContentLink`, `ApiUser`, `ApiInstructor`,
  `ApiEnrolledCourse(Schedule|Enrollment|Details)`, `ApiModule`, `ApiRecording`,
  `ApiMaterial`, `ApiAssignment`, `ApiSubmission(+RubricScore|grade|feedback|
  submissionHistory)`, `ApiConversation`, `ApiMessage`, `ApiCalendarEvent`,
  `ApiNotification`, `ApiBillingSummary/Breakdown/Registration/Payment`,
  `ApiSiwesRegistration`, `ApiAcceptanceLetter`, `ApiInternship(+Task|CheckIn|
  Payment)`, `ApiTeachingCohort(Detail)`, `SessionAttendanceResponse`,
  `ApiWebinar`, `ApiHelpResource`, `ApiScholarshipApplication`,
  `ApiAssignedModule/Assignment`.
- **Fixture dimensions** (so every screen has meaningful data): ≥2 courses,
  each with ≥2 schedules/cohorts (one active/completed), modules with
  recordings/materials/assignments; a seeded dual-role user (student +
  instructor) plus an instructor; conversations with threads; calendar events
  of each type; billing/payment + a waiver + installment plan; one internship
  placement; one scholarship application; referral records; attendance rows;
  webinars (upcoming + past); help resources; notifications; search index.

### Out of scope (explicitly deferred)
- Any page, layout, route or screen.
- **Auth flow UI — deferred to Plan 012** (final API/auth swap). The `(auth)`
  group exists as stubs only (Plan 002); real login/forgot/reset/invitation
  come last.
- Navigation chrome rendering (Plan 004).
- Any *business*-module code beyond the mock + shared infra.
- Re-theming the new design tokens to the old brand.
- Real axios transport + refresh — only the seam/interface is defined here;
  the live HTTP adapter lands at Plan 012.

## 3. Source reference

- `smarthub-api` — **contract source**: `src/models/*.ts` (wire shapes),
  `src/constants/index.ts` (enums). Read these; the mock mirrors them.
- `smarthub-core-lms/src/types/content-link.ts`
- `smarthub-core-lms/src/lib/utils.ts`
- `smarthub-core-lms/src/store/slices/*`, `src/configs/*`, `src/hooks/*`
- `smarthub-core-lms/src/components/providers/*`

> The axios client internals (`src/lib/api/client.ts`) are **reference only**
> for the interface — the live transport is added at Plan 012, not here.

## 4. Target files / structure

```
lib/
  utils.ts                 (extend)
  constants/api.ts
  constants/storage.ts
  api/
    constants.ts           (mirrored enums from smarthub-api/constants)
    types.ts               (mirrored wire types from smarthub-api models)
    client.ts              (the data-source seam interface; mock-backed now)
    mock/
      mockDatabase.ts      (wire-faithful records + seed fixtures)
      index.ts             (async query/mutation handlers)
    index.ts
  socket/socket-provider.tsx
  cloudinary-download.ts
  image.ts
  mime-extension.ts
  module-progress.ts
store/slices/
  authStore.ts
  roleModeStore.ts
  sidebarStore.ts
  uiStore.ts
configs/
  brand.ts
  nav.ts
hooks/
  use-page-param.ts
  use-notification-chime.ts
  use-title-notifier.ts
components/providers/
  app-providers.tsx
  query-provider.tsx
types/
  content-link.ts
```

## 5. shadcn components to use

- None required to prove foundation. (Sonner `Toaster` is a provider, not a
  base-vega primitive — pulled as a dependency.)

## 6. Steps

1. `npm i` the runtime deps and `npm i -D` dev deps (query-devtools).
2. Mirror the backend contract: `lib/api/constants.ts` (enums) +
   `lib/api/types.ts` (wire types) from `smarthub-api`.
3. Build the **data-source seam**: `lib/api/client.ts` interface + the
   `lib/api/mock/` adapter (`mockDatabase.ts` + handlers) fulfilling it.
4. Port `lib` utilities/helpers (utils, storage seam, socket, constants) —
   connecting the seam to the mock.
5. Port stores (auth seeded from mock users).
6. Port configs + hooks + providers (query wired to the mock).
7. Verify existing scaffold still builds + typechecks; quick dev-boot.

## 6.5 Architecture brief (see `ARCHITECTURE.md`)

1. **Deepen** — the API **data-source module** is the deep seam: a tiny surface
   (`get/post/put/patch/delete/getBlob` + refresh) hiding both the wire shape
   and the transport. Testable through that surface with the **mock adapter**
   now and a mock transport later — never through axios internals.
2. **Seams (real, not hypothetical)** — the mock adapter is deliberately the
   **first** adapter, so the API-client slot is a **genuine two-adapter seam**
   (mock now, axios at Plan 012). `storage` (SSR-safe) and `socket` are the
   two other tiny seams. Keep each small and independent.
3. **Testability** — `mockDatabase.ts` is pure data + pure query/mutation
   handlers → unit-testable in isolation. `configs/nav.ts` + mirrored enum
   constants are pure. New tests: utils (`formatPrice`/`formatDate`/`timeAgo`),
   the mock handlers (query a course, create a submission), and nav composition.
4. **ADR** — record the foundation decisions: module-per-domain shape, shared
   axios client + single-flight refresh, normalise-in-`select`, Zustand+TanStack
   split, keep new design system, **contract source = smarthub-api**, and the
   **UI-first mock data-source adapter behind the API seam (auth/API last)**.

## 7. Acceptance checks

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run dev` boots; placeholder home page still renders
- [ ] `lib/api/types.ts` + `constants.ts` mirror the smarthub-api contract
      (spot-check enums + key wire shapes)
- [ ] `mockDatabase.ts` seeds realistic wire-shaped fixtures (courses,
      cohorts, modules, recordings, materials, assignments, submissions,
      conversations, billing, internship, scholarship, attendance, webinars)
- [ ] Mock handlers exposed through the API-client seam return
      Promise-shaped data; a throwaway hook/query proves it
- [ ] `CONTEXT.md` seeded with domain glossary
- [ ] Foundation ADRs recorded in `docs/adr/`

## 8. Open questions / to confirm

- Keep source Zustand persist keys vs new names (e.g.
  `smarthub-core-lms.auth.v1` → something else)? Confirm.
- Include `@sentry/nextjs` now or defer? Confirm.
- Where to place the mirrored contract: `lib/api/types.ts` + `constants.ts`
  vs a top-level `contracts/` folder imported by both mock and later modules?
  Confirm (recommend `lib/api/` for locality with the seam).
