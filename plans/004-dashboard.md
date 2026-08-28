# PLAN 004 — Dashboard

**Status:** Draft (awaiting confirmation)
**Owner:** SmartHub port
**Depends on:** 001 (Foundation), 002 (app-shell & routes), 003 (navigation chrome)

---

## 1. Goal

Build the **dashboard** as a **composition** layer — a single landing page
(`/dashboard`) that stitches together existing cross-module data through each
module's **public query surface + normalised UI types**, all read from the
Foundation mock data source. This plan owns **no new domain logic**: it
re-presents what courses, assignments, billing, referrals, webinars, calendar,
assigned-modules and progress already expose, ordered as a "what do I need
right now?" pyramid.

The dashboard is the first screen that exercises the composition contract of
the whole port: modules render their own widgets, the page only arranges them.
That discipline is what lets later plans (012) swap the data source behind the
same seam without touching the dashboard.

---

## 2. Scope

### In scope
- **Route + page shell** — `app/(app)/dashboard/page.tsx` renders a
  `DashboardPage` that branches on effective mode (student body vs instructor
  content), delegating to the module `*PageContent`/widget surfaces exactly as
  the source does.
- **Welcome hero** — greeting line from `AuthUser` (firstName) + enrolled
  course count; **not** a separate card, per source.
- **Stats strip** — four-up KPI tiles (To do / Awaiting marking / Reviewed /
  Overdue) computed from the **assignments** rollup; each tile deep-links into
  `/assignments?filter=...`. Ported `DashboardStatsStrip`.
- **Course progress list** — per-course assignment completion (done/total +
  % bar) from the **Course** + **Assignment** shapes. Ported
  `CourseProgressList`.
- **Dashboard widgets** (each self-gates to `null` when empty; the slot
  collapses cleanly):
  - **billing** — `DashboardBillingWidget` from `BillingBreakdown.overall.
    totalDue` (hidden when balance ≤ 0).
  - **referrals** — `DashboardReferralsWidget` from `ReferralsResponse`
    (code/eligibility + commissionRate + totals; hidden without a code).
  - **webinars** — `DashboardWebinarsWidget` from `WebinarSummary` list,
    preview next 1–2 upcoming.
  - **calendar** — `DashboardCalendarCard` from `CalendarEventUI` month grid +
    "up next" deadline surface.
  - **assignments** — pending/overdue noise already covered by the stats
    strip; this slice confirms the source surfaces that feed it.
  - **assigned-modules** — `DashboardAssignedModulesWidget` from
    `AssignedModule` list, preview most-recent 2 grants.
  - **progress/achievements** — `ProgressPulseCard` from `ProgressSnapshot` +
    `Achievement[]` (personal pulse + recent earned badges, non-comparative).
- **Role branch** — instructor mode renders the teaching dashboard instead of
  the student body (render-time branch on effective role).
- **Loading states** — per-widget skeletons (no layout shift), matching
  source; empty widgets collapse rather than show empty-state cards.

### Out of scope (explicitly deferred)
- Any new domain module, service, query or normaliser. This plan **consumes
  only existing** module `api/*.queries` + `types/index.ts`.
- The `/assigned`, `/billing`, `/webinars`, `/calendar`, `/refer-and-earn`
  pages themselves — this plan only places their **widget** surfaces; the
  pages land with their own modules (Plans 005–009).
- Auth flow UI (Plan 012) and the real API adapter (Plan 012). Data is 100%
  mock-backed.
- Any new shadcn primitives beyond the list in §5; the widgets reuse
  existing module components re-authored on `base-vega`.
- Re-theming or altering the new design system tokens.

---

## 3. Source reference

- `smarthub-core-lms/src/app/(app)/dashboard/page.tsx` — the composition
  contract: what the dashboard reads, in what order, which widgets render,
  and the role branch. **Behavior reference — re-author on `base-vega`, do not
  copy tokens/Radix.**
- `smarthub-core-lms/src/modules/dashboard/components/StatsStrip.tsx` — KPI
  tile logic (status buckets: `draft` → To do, `submitted` → Awaiting, `graded`
  → Reviewed, `overdue` → Overdue).
- `smarthub-core-lms/src/modules/dashboard/components/CourseProgressList.tsx`
  — per-course rollup + `isDone` status set.
- Widget components (each read through its module's public query surface):
  - `assigned-modules/components/DashboardAssignedModulesWidget.tsx`
  - `billing/components/DashboardBillingWidget.tsx`
  - `referrals/components/DashboardReferralsWidget.tsx`
  - `webinars/components/DashboardWebinarsWidget.tsx`
  - `calendar/components/DashboardCalendarCard.tsx`
  - `progress/components/ProgressPulseCard.tsx`
- UI types (contract for the dashboard's consumed shapes):
  `courses/types/index.ts` (`Course`), `auth` (`AuthUser`),
  `assignments/types/index.ts` (`Assignment`), `billing/types/index.ts`
  (`BillingBreakdown`, `BillingSummary`), `referrals/types/index.ts`
  (`ReferralsResponse`), `webinars/types/index.ts` (`WebinarSummary`),
  `calendar/types/index.ts` (`CalendarEventUI`),
  `assigned-modules/types/index.ts` (`AssignedModule`),
  `progress/types/index.ts` (`ProgressSnapshot`, `Achievement`).

---

## 4. Target files / structure

```
app/(app)/dashboard/
  page.tsx                  # thin route → <DashboardPage> (mode branch)
modules/dashboard/
  components/
    DashboardPage.tsx      # mode branch → student body | instructor content
    StudentDashboardBody.tsx  # composition: hero + stats + widgets + lists
    StatsStrip.tsx         # four-up KPI tiles (from assignments rollup)
    CourseProgressList.tsx # per-course completion list
```

Re-authored widget components land inside their **own** modules (they are
domain surfaces, not dashboard-owned), mirroring the source:

```
modules/assigned-modules/components/DashboardAssignedModulesWidget.tsx
modules/billing/components/DashboardBillingWidget.tsx
modules/referrals/components/DashboardReferralsWidget.tsx
modules/webinars/components/DashboardWebinarsWidget.tsx
modules/calendar/components/DashboardCalendarCard.tsx
modules/progress/components/ProgressPulseCard.tsx
```

> **Composition rule:** `StudentDashboardBody` imports only each module's
> `*PageContent`/widget/public exports and query results. It must never reach
> into a module's service, normaliser, or wire types directly — those stay
> private behind the module interface (see §6.5).

---

## 5. shadcn components to use (via MCP)

Pull from the `base-vega` preset through the shadcn MCP:

- `card` (`CardHeader`/`CardTitle`/`CardContent`) — every widget shell.
- `badge` — welcome-hero "Pick up"/continuation tags, per-course labels.
- `separator` — dividers between stacked widgets / list rows where the source
  uses `divide-y`.
- `progress` — per-course completion bars (`CourseProgressList`).
- `avatar` — welcome hero / achievement badges where identity is shown.
- `skeleton` — per-widget loading placeholders (no layout shift).
- `button` — widget CTA affordances ("View billing", "Resume", "See all").
- `dialog` — calendar event-detail surface opened from `DashboardCalendarCard`.

Existing `lucide` icons (`ClipboardList`, `Hourglass`, `CheckCircle2`,
`AlertCircle`, `CreditCard`, `Share2`, `Presentation`, `Calendar`, `Target`,
`Trophy`, `ArrowRight`, …) are used via imports, not re-registered.

---

## 6. Steps

1. **Pull shadcn components** (§5) into the project via the MCP.
2. **Confirm the mock exposes everything this plan needs** in
   `lib/api/mock/mockDatabase.ts` (seeded by Foundation): enrollments with
   progress, submissions stats, billing breakdown, referral records, webinars,
   upcoming calendar events, pending assignments, achievements. Top up
   fixtures only if a widget has no sample data — do not add new surfaces.
3. **Port the assigning/data-consuming widgets** into their owning modules
   (billing, referrals, webinars, calendar, assigned-modules, progress),
   each re-authored on `base-vega`, each reading through its module's existing
   query hook. Confirm each self-gates to `null` when empty.
4. **Port the two dashboard-local components** — `StatsStrip.tsx` and
   `CourseProgressList.tsx` — reading the assignments rollup through the
   assignments module's query surface (no direct service calls).
5. **Build `DashboardPage` + `StudentDashboardBody`** — the mode branch and
   the composition order: greeting → widget nag grid (each self-gating) →
   stats strip → progress pulse → webinars → assigned-modules → continue-
   learning → calendar + deadlines → progress-by-course → your-courses.
6. **Wire the route** `app/(app)/dashboard/page.tsx` to `DashboardPage`.
7. **Delete-test sweep (see §6.5.1):** for each widget, delete its
   `<Foo />` line from the body and confirm no dangling layout or dead import
   remains — the widget set must be independently removable.
8. **Verify** per §7 (typecheck, lint, dev-boot, render against mock).

---

## 6.5 Architecture brief (see `ARCHITECTURE.md`)

1. **Deepen** — the dashboard is intentionally **shallow by design**: it
   arranges, it does not implement. Deletion-test each widget (`Steps.7`): the
   page's only real complexity is the **composition order + role branch**,
   which earns its keep as the product's "what do I need right now?" logic.
   The depth lives in the source modules (billing balance rollup, referrals
   eligibility, webinar join-window, calendar month-window query) — the
   dashboard must not re-implement any of it. If a widget would merely
   pass-through, delete it here and let the dedicated module page own it.
2. **Seams** — the composition happens exclusively through each module's
   **public query surface + normalised types**. That public surface *is* the
   seam the dashboard crosses; it must stay free of layout/nav concerns, and
   no layout logic may leak back into a module's API/config. The data source
   behind those queries is already a real two-adapter seam (mock now, axios at
   Plan 012) from Foundation — the dashboard consumes it unchanged.
3. **Testability** — the dashboard is testable *through* the modules' query
   seams: feed each widget mock-rich query data and assert render +
   self-gating (`null` when empty). New tests: `StatsStrip` bucket math on a
   known assignment set; `CourseProgressList` rollup + sort by pct; each
   widget's null/hidden path and preview slicing (webinars/assigned preview
   `[0..2]`, achievements `filter(a.earned).slice(0,3)`). Widgets stay
   individually testable because they own their queries.
4. **ADR** — record: **the dashboard is a composition point, not a module** —
   it consumes each module's public query surface, renders that module's
   widgets, and owns only ordering/role-branch logic. This guards against a
   future "dashboard mega-module" that duplicates queries or reaches into
   private service/normaliser internals.

---

## 7. Acceptance checks

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes (if feasible)
- [ ] `npm run dev` boots; `/dashboard` renders without error
- [ ] Student mode shows: welcome hero (AuthUser name + course count), stats
      strip, course-progress list, and the composed billing / referrals /
      webinars / calendar / assigned-modules / progress widgets — all from
      mock data
- [ ] Each widget **self-gates**: with no outstanding balance / no referral
      code / no upcoming webinars / no assigned modules, its slot collapses to
      zero height rather than showing an empty card
- [ ] Instructor mode renders the teaching surface in the same nav slot
- [ ] Stats-strip tiles deep-link into pre-filtered `/assignments?...`
- [ ] Widgets render via their **own** module query hooks (spot-check: a
      widget still renders if the dashboard page only imports it, not if the
      page calls a module service directly)

---

## 8. Open questions / to confirm

- Which of the source's nag widgets (billing, referrals, acceptance-letter,
  internship, internship-payment, tech-scholarship) ship in this dashboard
  slice vs deferred with their owning modules? Recommend: billing + referrals
  now; acceptance-letter/internship/scholarship defer to Plans 009–010 since
  their modules aren't ported yet.
- Keep the source's exact section order (calendar deadlines row, continue-
  learning prominence) or measure first? Recommend keeping source order.
