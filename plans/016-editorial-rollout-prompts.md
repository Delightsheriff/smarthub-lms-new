# PLAN 016 — Editorial Rollout: Handoff Prompts (slices 2+)

**Status:** Ready to hand off
**Owner:** SmartHub design-system modernization (same track as Plan 015)
**Depends on:** Plan 015 (analysis + tokens/fonts), slice 1 (Courses,
commits `0e4fcb3`, `6934557`, `05da5ff`) — already shipped and
live-verified. **Read that code before writing any new code** — it is
the reference implementation every prompt below points back to.

---

## 0. What this file is

Plan 015 analyzed `smarthub-core-client`'s editorial design system and
proposed a scoped sync. Slice 1 (Courses) proved the pattern out. This
file is a set of **self-contained prompts**, one per remaining slice,
written so a fresh agent — with no memory of the conversation that
produced Plan 015 or the Courses build — can pick up any one of them
and execute it correctly.

Each prompt below is meant to be handed to an agent **on its own**
(copy the whole "Slice N" section as the task). Do not run more than
one slice concurrently in the same working tree — see §2's git-hazard
note.

After each slice ships, the *original* session (the one that has the
full history of this rollout) verifies it — visually, in the browser,
against real data — before the next slice starts.

---

## 1. Required reading, before touching any code

In order:

1. `plans/015-editorial-design-sync.md` — the full analysis: color
   tokens, typography, layout primitives, the narrative-vs-dense
   surface split (§3), and the OKLCH conversion values already
   computed and verified against this repo's existing brand-color
   conversions.
2. `plans/DESIGN-SYSTEM.md` — the master context for this whole track.
   Non-negotiables in §4 apply to every slice below (no raw Tailwind
   colors, solid active-states not tints, `Select` not `DropdownMenu`
   for filters, one background per page, motion needs a reason).
3. The actual diffs from slice 1 — read these files as they exist
   *now* on `main`, not as a diff:
   - `app/globals.css` — the `.canvas-warm` / `.canvas-brand` scoped
     token classes, the `rise` keyframe, the `font-display` mapping.
   - `app/layout.tsx` — how Fraunces is loaded alongside Inter/JetBrains
     Mono.
   - `components/layout/page-header.tsx` — the `variant="editorial"`
     addition. **This is the primitive every slice below reuses.**
   - `modules/courses/components/CourseCard.tsx` — the reference card
     pattern (scrim, eyebrow label, stretched link, hover-fill arrow).
   - `modules/courses/components/CourseDetailPageContent.tsx` — the
     reference hero + hairline stat-strip + section-heading pattern.
   - `modules/courses/components/course-module-row.tsx` — the reference
     serif-numbered-list-row pattern (bare number, no badge box).

Two bugs were found and fixed globally during slice 1 — you do not need
to redo these, but should know about them:

- `components/ui/select.tsx` and `components/ui/dropdown-menu.tsx` used
  to force every popover into dark-mode colors regardless of the app's
  theme (a stray literal `"dark"` class). Fixed — popovers now follow
  the current theme everywhere, automatically.
- `CircularProgress` badges across course cards/outline/lesson-player
  used to render their percentage at 9–11px, illegible. Sizes were
  bumped app-wide. If you add a new `CircularProgress` badge, use
  `size={34}`–`{42}` with `text-xs`/`text-sm`, not smaller.

---

## 2. Ground rules for every slice

- **Commit incrementally, one slice per commit (or a few tightly
  related commits).** Run `git status -s` and `git diff --stat`
  immediately before every commit — this repo has a documented history
  of concurrent-agent git collisions (`plans/DESIGN-SYSTEM.md` §7).
  Never `git add -A`; name exact paths.
- **`npx tsc --noEmit` and `npx eslint <changed files>` clean before
  calling anything done.**
- **Browser-verify against real data before committing.** The dev
  servers run via `mcp__Claude_Browser__preview_start({name:
  "smarthub-lms-new"})` (frontend) and the backend `smarthub-api` on
  port 6001. Log in as `delightsheriff@gmail.com` — this account is
  enrolled in one real cohort ("Data Science") in the dev DB
  specifically so editorial surfaces can be checked against real
  enrollment data instead of empty states. If a slice needs enrollment
  data the account doesn't have (e.g. a webinar registration, a
  self-paced entitlement), **do not seed the shared dev DB yourself** —
  flag it to the user and wait, the same way this was handled earlier
  in the rollout. It's fine to verify structurally/via empty-state
  rendering when real data isn't available; say so explicitly rather
  than claiming a visual check that didn't happen.
- **Check both light and dark mode** for anything using `.canvas-warm`
  or `.canvas-brand` — the dark-mode token overrides are already
  written into `globals.css`, but verify the actual contrast, don't
  assume.
- **Update the relevant `plans/pages/*.md` doc's status** (following
  the pattern already used for `courses.md`) and cross-link back to
  this plan, plus flip this file's own checklist (§4) for the slice you
  completed.
- **Never touch:** `components/ui/sidebar.tsx`, `AppSidebar`,
  `BottomNav`, `TopBar`, `RoleSwitcher` (Plan 014 owns this — it's
  deliberately not editorial), any data table, any form (Profile
  banking/professional tabs, assignment submission, grading), the
  Calendar month/week/day grids (`MonthGrid`/`WeekGrid`/`DayView` —
  the header/eyebrow can go editorial, the grid itself stays dense).

---

## 3. The narrative/dense split, restated concretely

From Plan 015 §3, applied to the actual remaining pages:

**Narrative (full editorial: `PageHeader variant="editorial"`, serif
headings, `.canvas-warm`/`.canvas-brand` where a hero-like block exists,
hairline dividers over boxed cards where a list is being redesigned
anyway):**
- Dashboard hero/greeting
- Self-paced lesson player chrome + course landing page (partially done
  — cards/rings fixed, hero/lesson-list treatment still open)
- Refer & Earn
- Tech Scholarship dashboard card
- Auth screens (login/register/forgot-password)
- Certificates (if/when a certificate view exists as its own surface)

**Light touch only (`PageHeader variant="editorial"` on the header row
alone — eyebrow + serif title — nothing else changes; the page's actual
content, tables, and forms stay exactly as they are):**
- Recordings, Materials, Tasks/Assignments list, Assigned-to-you,
  Activity, Inbox, Webinars, Help, Internship overview (not its payment
  form), Billing (header only — the actual billing table/history stays
  dense and untouched)

**Do not touch at all this rollout:**
- Nav/sidebar/topbar chrome (Plan 014)
- Calendar's grid views (header eyebrow is fine, per above)
- Profile's tabs (all forms)
- Self-paced-sales instructor tabs, Payments route (financial precision
  surfaces — not yet even audited for correctness, see the open
  "verification backlog" item; don't restyle before that audit happens)
- Teaching-mode surfaces generally (`modules/teaching/*`) — operator
  tool for instructors, Plan 014's aesthetic, not this one

---

## 4. Slice checklist

- [x] Slice 2 — Dashboard hero
- [ ] Slice 3 — Self-paced lesson player + course landing page hero
- [ ] Slice 4 — Refer & Earn + Tech Scholarship card
- [ ] Slice 5 — Auth screens
- [ ] Slice 6 — Light-touch `PageHeader` pass (list pages)

---

## Slice 2 — Dashboard hero

**Goal:** Give the dashboard greeting the same editorial treatment as
the Courses page header, since it's the first thing every user sees on
login and is currently a plain one-line greeting.

**Read first:** `app/(app)/dashboard/page.tsx` in full (it's the whole
`StudentDashboardBody` — no separate module component file exists for
this page). Also re-read `components/layout/page-header.tsx` and
`modules/courses/components/CourseDetailPageContent.tsx`'s hero block
(the `.canvas-warm` wrapper) as your pattern reference.

**In scope:**
- Replace the current one-line "Hey {name}" greeting with an editorial
  hero block: eyebrow (e.g. "Dashboard" or a time-of-day-based label
  like "Good morning"), serif display greeting, and — if there's a
  natural single most-relevant piece of context (e.g. "you're 60%
  through Data Science" or "3 tasks due this week") — a short lede
  line under it, matching the hero pattern's rhythm. Don't invent new
  data sources; only surface what's already fetched on this page
  (`useCourses`, the stats/progress hooks already imported).
- The hero block may use `.canvas-warm` if it reads well as a
  contained block; if it's better as page background inline (no boxed
  card), that's also fine — use judgment, check both, screenshot both,
  pick the one that doesn't fight the widgets below it.
- Everything below the greeting (stats strip, progress pulse, widgets,
  course lists) **stays exactly as it is** — those are dense/functional
  surfaces, not in scope.

**Out of scope:** `TeachPageContent` (instructor dashboard — Plan
014/operator-tool territory, not this rollout).

**Acceptance:**
- [ ] Greeting reads as a genuine editorial hero, not just a bigger
      font on the same one-liner.
- [ ] Rest of the dashboard unchanged pixel-for-pixel.
- [ ] Verified in browser, light + dark, real data (delightsheriff has
      one enrolled course — confirm the greeting's context line, if
      you add one, doesn't break when `courses` is empty vs populated).
- [ ] `plans/pages/home-dashboard.md` status line updated.

---

## Slice 3 — Self-paced lesson player + course landing page hero

**Goal:** Slice 1 fixed self-paced course *cards* and progress-ring
legibility. The lesson player's surrounding chrome and the self-paced
course landing page's hero were explicitly named in Plan 015 §3.1 as
narrative surfaces still needing the full treatment.

**Read first:** `modules/self-paced/components/LessonPlayerPageContent.tsx`,
`modules/self-paced/components/SelfPacedCoursePageContent.tsx`,
`modules/self-paced/components/LessonList.tsx`. Also
`plans/pages/self-paced-courses.md` for the existing legacy-parity
context (this module is a near-perfect legacy port — you're doing
visual work only, not fixing behavior).

**In scope:**
- `SelfPacedCoursePageContent.tsx`: give the course header the same
  `.canvas-warm` + eyebrow + serif-title treatment as the cohort course
  landing page. The "Lessons" card can adopt the serif-numbered-row
  pattern from `course-module-row.tsx` if lessons are listed similarly
  — check first; if the structure differs meaningfully, use judgment
  rather than forcing a mismatched pattern.
- `LessonPlayerPageContent.tsx`: the top bar around the video player
  (title, progress ring, lesson count) can take a lighter serif touch
  (e.g. `font-display` on the lesson title) — **do not** apply
  `.canvas-warm` inside the player itself; the video needs a neutral
  frame, not a warm background competing with it for attention.
- `LessonList.tsx`: this is a navigation rail (like `course-outline.tsx`)
  — dense/functional, not a narrative surface. Leave its structure
  alone; a `font-display` touch on lesson titles is fine if it matches
  what was done to `course-outline.tsx`'s module titles, nothing more.

**Out of scope:** The video player itself, the "Mark complete" logic,
the mobile drawer (all functional, already correct per this session's
earlier audit).

**Acceptance:**
- [ ] Course landing page hero matches the cohort course page's
      editorial voice (eyebrow, serif title, hairline meta).
- [ ] Lesson player top bar reads coherently with the rest of the
      editorial pages without competing with the video for attention.
- [ ] Verified in browser — note in your report if self-paced
      enrollment data still doesn't exist in the dev DB (it didn't as
      of slice 1); if so, verify structurally and say so, don't claim
      a visual check that didn't happen.
- [ ] `plans/pages/self-paced-courses.md` status line updated.

---

## Slice 4 — Refer & Earn + Tech Scholarship card

**Goal:** These are explicitly marketing-adjacent surfaces already
inside the app (Plan 015 §3.1 names them directly) — good candidates
for the full editorial treatment since they're persuasive/promotional
by nature, not operational.

**Read first:** `modules/referrals/components/ReferralsPanel.tsx` (the
`/refer-and-earn` page body), `modules/tech-scholarship/components/
TechScholarshipCard.tsx` (a dashboard widget, not its own page).

**In scope:**
- `ReferralsPanel.tsx`: it already uses `PageHeader` — switch to
  `variant="editorial"` with an eyebrow. The share-link/stats sections
  can adopt the hairline-divided stat-strip pattern from
  `CourseDetailPageContent.tsx` if there's a natural fit (referral
  count, earnings, pending payouts) — check the actual data shape
  before assuming this maps cleanly.
- `TechScholarshipCard.tsx`: this is a compact dashboard widget, not a
  full page — don't force a full hero treatment into a small card. A
  serif title + the eyebrow micro-label pattern is enough; keep its
  existing compact footprint.

**Out of scope:** `BankingTab.tsx`, `CopyableCode.tsx`,
`ProgramShareLink.tsx`'s functional logic — visual polish only, don't
touch the payout request flow or banking form.

**Acceptance:**
- [ ] `/refer-and-earn` reads as an editorial, persuasive page, not a
      dense settings panel.
- [ ] `TechScholarshipCard` gets a lighter, proportionate touch — no
      full canvas-warm block crammed into a small card.
- [ ] Verified in browser, light + dark.
- [ ] `plans/pages/refer-and-earn.md` status line updated.

---

## Slice 5 — Auth screens

**Goal:** Named directly in Plan 015 §3.1. Auth screens are a
first-impression surface (before a user even reaches the dense app),
and legacy already treats them as somewhat separate via the
`AuthCard`/`AuthCardBody`/`AuthColumn` primitives (`plans/DESIGN-
SYSTEM.md` §3).

**Read first:** `modules/auth/components/AuthCard.tsx` and whatever
consumes it (login, register, forgot-password screens — find via
`grep -rl AuthCard modules/auth app`). Also re-read
`plans/DESIGN-SYSTEM.md` §4's "one page, one background" rule before
touching these — this exact bug class (a nested full-height background
box) took out all four auth screens once already in this track.

**In scope:**
- `AuthCard`/`AuthColumn`: consider whether a `.canvas-warm` or
  `.canvas-brand` background for the non-form column (if one exists —
  check the actual layout first) gives the auth flow more character,
  matching core-client's own login treatment if it has one worth
  referencing (`smarthub-core-client/src/app/(auth)/`).
- Headings on each auth screen can go `font-display`.
- **The form column itself (inputs, buttons, validation) stays exactly
  as it is** — auth forms are the one place correctness matters more
  than anything, don't introduce visual changes that touch focus
  states, tab order, or error message placement.

**Acceptance:**
- [ ] No regression on the "one page, one background" rule — check
      this specifically, it's a known failure mode here.
- [ ] Login/register/forgot-password all still function (submit,
      validation errors, redirect on success) — actually test the
      login flow in the browser, don't just eyeball it.
- [ ] Verified light + dark.

---

## Slice 6 — Light-touch `PageHeader` pass (list pages)

**Goal:** A mechanical, low-risk pass applying `PageHeader
variant="editorial"` (eyebrow + serif title, nothing else) to every
remaining page whose actual content is a list/table/feed and should
stay dense. This is intentionally the smallest-effort, most repetitive
slice — batch it as one pass across all the pages below rather than
treating each as its own investigation.

**Pages and files** (verify each path still matches before editing —
module contents may have shifted):
- Recordings — `modules/learning/components/recordings-page-content.tsx`
  (confirm exact filename via `grep -rl PageHeader modules/learning`)
- Materials — same module, materials page-content equivalent
- Tasks/Assignments list — `modules/assignments/components/
  assignment-list-page-content.tsx`
- Assigned to you — `modules/assigned-modules/components/
  AssignedModulesPageContent.tsx`
- Activity — `modules/activity/components/MyActivityPageContent.tsx`
- Inbox — `modules/conversations/components/InboxPageContent.tsx`
- Webinars — `modules/webinars/components/WebinarsPageContent.tsx`
- Help — `modules/help/components/HelpPageContent.tsx`
- Internship overview — `modules/internships/components/
  InternshipWorkspacePageContent.tsx` (its payment sub-page stays
  untouched — financial surface)
- Billing — `modules/billing/components/BillingPageContent.tsx`
  (header only; the transaction/payment history table underneath is
  explicitly out of scope)

**For each page:**
1. Find its `<PageHeader ... />` call.
2. Add `variant="editorial"` and a short, accurate `eyebrow` (match the
   nav section it lives under — "Learning", "Money", "Internship", etc.
   — see `configs/nav.ts` groupings if unsure).
3. Change nothing else on the page. No card restructuring, no
   `.canvas-warm`, no serif body text. If the page's `<div>` wrapper
   needs `font-sans` added for the header's prose to render correctly
   (the same fix slice 1 needed — the app's base font is JetBrains
   Mono), add it scoped to just the header area if possible, matching
   how `CoursesPageContent.tsx`/`CourseDetailPageContent.tsx` did it if
   the whole page reads better in sans, or scope it to the `PageHeader`
   wrapper alone (already handled by `PageHeader`'s own `font-sans`
   class from slice 1 — verify it's actually taking effect before
   adding anything extra).
4. Typecheck, lint, screenshot, move to the next page.

**Acceptance:**
- [ ] Every listed page's header reads eyebrow + serif title, rest of
      the page pixel-identical to before.
- [ ] One commit per page (or a few pages grouped if genuinely trivial)
      — don't batch all ten into one uncommitted working session, per
      the git-collision discipline in §2.
- [ ] Each page's `plans/pages/*.md` status line gets a one-line note.
