# PLAN 019 — Handoff Prompt: Data-Fetching, Caching, Coordinated Loading, Refresh, Debounce

**Status:** Ready to hand off
**Owner:** SmartHub design-system modernization (same track as Plans 014–018)
**Depends on:** Nothing structurally — read `plans/DESIGN-SYSTEM.md` §4
(non-negotiables) and §7 (concurrent-agent git discipline: small commits,
`git commit -- <exact paths>`, never a bare `git commit`/`git add -A`)
before starting.

This is a real investigation-plus-implementation job, not a mechanical
pass. **A full codebase audit already happened — the findings below are
factual, code-grounded, and current as of this writing (file paths and
line numbers included). Re-verify anything you're about to change (a
line number may have shifted), but don't re-run the whole audit from
scratch — build on this.**

---

## 0. What's actually true today (the audit)

### 0.1 — QueryClient config

One shared default, in `components/providers/query-provider.tsx`:

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})
```

No `gcTime`, no `retry`, no `refetchOnReconnect` default — those fall
back to TanStack Query's own defaults (`gcTime: 5min`, `retry: 3`,
`refetchOnReconnect: true`).

On top of that single baseline, **13 individual query hooks across 8
modules** silently override `staleTime` with no documented tiering —
values found in the wild: `30s` (search), `60s` (several — same as the
default, so redundant), `5min` (self-paced catalog, progress
achievements, access checks, push, jobs list), `10min` (progress
pulse), `30min` (jobs companies list). There's no visible rule for
which value applies to which *kind* of data — it reads as whatever
felt right in the moment per file, not a system.

One deliberate, correct exception: the self-paced playback-token query
(`modules/self-paced/api/self-paced.queries.ts`) sets
`staleTime: 0, gcTime: 0, refetchOnWindowFocus: false,
refetchOnReconnect: false` — a signed, single-use token that must never
be cached. Leave this one alone; it's correct, not an inconsistency to
"fix."

Two other real per-query knobs, also fine as-is: a custom `retry`
predicate (`modules/self-paced/lib/access-denial.ts`) that skips
retrying 403/404 entitlement denials on 5 self-paced queries, and
`refetchInterval: 30_000` on the attendance-session query
(`modules/teaching/api/attendance.queries.ts`) — the only polling query
in the app.

### 0.2 — Mutation → cache invalidation: confirmed gaps

The dominant, correct convention: a mutation's `onSuccess` calls
`queryClient.invalidateQueries` against the same `<MODULE>_QUERY_KEYS`
factory object its sibling queries read from. This works in most
places. **Three confirmed real bugs where it doesn't:**

1. **Grading a submission from the cohort workspace doesn't refresh the
   instructor dashboard's grading tiles.** `useGradeSubmission`
   (`modules/teaching/api/teaching.queries.ts`, used by
   `CohortSubmissionsTab.tsx`) invalidates only
   `TEACHING_QUERY_KEYS.submissions(scheduleId)` and
   `.assignments(scheduleId)` — never `.inbox(limit)` or
   `.recentSubmissions(limit)`, which is exactly what
   `NeedsGradingStrip` and `RecentSubmissionsTile` read on `/teach` and
   `/dashboard`. Grade a submission from a cohort tab, and the teaching
   dashboard still shows it as needing grading until a manual refresh.
   **The fix already exists in the same file** — the sibling
   `useGradeSubmissionFromInbox` correctly invalidates both keys.
   Bring `useGradeSubmission` in line with it.
2. **Marking session attendance doesn't refresh that student's
   attendance history.** `useMarkSessionAttendance`
   (`modules/teaching/api/attendance.queries.ts`) invalidates only
   `ATTENDANCE_QUERY_KEYS.session(sessionId)`, never `.student(...)` —
   which `StudentAttendanceSheet.tsx` reads. Open that sheet right
   after marking someone present/absent and it shows stale history.
3. **`useRegenerateScholarshipBanner`**
   (`modules/tech-scholarship/api/tech-scholarship.queries.ts`) only
   `setQueryData`s the banner key; it never invalidates
   `SCHOLARSHIP_QUERY_KEYS.me`. Lower confidence than 1/2 (may be
   intentional if the banner is a pure derived artifact with no
   server-side side effect on the application record) — check the
   backend endpoint before "fixing" this one; if the endpoint only
   returns a new banner asset and mutates nothing else, leave it and
   note why in the commit message instead.

Also fix, same category (query-key hygiene, not literally broken
today but a real drift risk):
- `modules/acceptance-letters/api/acceptance-letters.queries.ts`
  invalidates `["siwes-profile", "my-registrations"]` as a hand-typed
  literal instead of importing
  `SIWES_PROFILE_QUERY_KEYS.myRegistrations` from
  `modules/siwes-profile/api/siwes-profile.queries.ts` — the two can
  silently drift apart. Import the real constant.
- `modules/teaching/api/teaching.queries.ts`'s
  `useGradeSubmissionFromInbox` invalidates `["teaching","inbox"]` /
  `["teaching","recent-submissions"]` as raw literals instead of
  calling `TEACHING_QUERY_KEYS.inbox(limit)` /
  `.recentSubmissions(limit)` (which take a `limit` param the literal
  conveniently omits). Works today via prefix-matching; fix it so it
  doesn't silently stop matching if the factory's key shape changes.
- `modules/learning/api/content.queries.ts` has **no**
  `<MODULE>_QUERY_KEYS` factory at all — 4 queries use bare inline
  arrays, and its one mutation invalidates a hand-typed `["courses"]`
  prefix that lives in a *different module's* key namespace than its
  own file. Give it a proper factory matching every other module's
  convention, and invalidate through it.
- Do NOT "fix" `modules/courses/api/courses.queries.ts`'s
  `useCourseModule` manually reading/writing
  `COURSES_QUERY_KEYS.bySlug(slug)`'s cache entry inside its own
  `queryFn` — audit it, understand why it's there, and only touch it
  if you find it's actually wrong, not just unusual.

Auth mutations, `useDownloadCurriculum`, `useUploadAssignmentFile`,
`useTrackMaterialDownload`, `useRotateAttendancePin` correctly skip
invalidation — none of them back a cached list/detail view. Don't add
invalidation calls that have nothing to invalidate.

### 0.3 — Skeleton / coordinated loading: the real pattern

**Single-query pages are uniformly fine already** — Assignments,
Recordings, Materials, Billing, Activity, Internships, Calendar all
show a skeleton shaped like the final content. Leave these alone.

**Every multi-query composite page/surface reveals content piecemeal,
with zero coordination anywhere in the codebase.** The two real,
distinct problems inside that finding — don't conflate them:

**Problem A — a widget genuinely has no loading UI at all** (not a
"staggered is fine" case — a straight-up missing skeleton, meaning a
blank space that just pops content in):
- `DashboardBillingWidget.tsx` and `DashboardCalendarCard.tsx` on
  `/dashboard` don't even destructure `isLoading` from their query —
  they render off `data` directly.
- `/payments` (`PaymentsPageContent.tsx`): `useMyInstallmentPlans`'s
  `isLoading`/`isFetching` isn't destructured either — installment
  cards just appear with zero indicator. The submissions list at the
  bottom does have loading state, but it's a bare spinner + "Loading…"
  text, not a `Skeleton` matching the list's shape.
- `/refer-and-earn` (`ReferralsPanel.tsx`): the `banking` query has no
  loading UI at all; `payouts` has its own nested skeleton but the
  page's top-level gate only waits on `useMyReferrals`.

**Fix Problem A everywhere it appears**: every independent query on a
page needs *some* loading UI — a `Skeleton` shaped like its content,
minimum. This is not optional and not a judgment call.

**Problem B — genuinely independent widgets on a dashboard-style grid
revealing at different times.** This is real (student dashboard has
~13 independent queries, teaching dashboard has 4, none coordinated),
but per Plan 017's own guidance, staggered loading on a page of
*clearly separate widgets* is legitimate UX, not automatically a bug.
**Use judgment per page, and say which you chose and why:**
- `/dashboard` (both roles) and the teaching dashboard
  (`TeachPageContent.tsx`): these are widget grids where each card is
  its own logical unit (billing, referrals, progress, deadlines,
  calendar, etc.) — staggered reveal reads as normal here, the same
  way a real dashboard (Stripe's, Linear's) doesn't block its whole
  page on its slowest widget. **Leave these staggered — just fix
  Problem A's missing skeletons within them.** Do not force a single
  page-wide skeleton gate here; that would make the *fast* widgets
  wait on the *slowest* one for no UX benefit.
- The teaching **cohort workspace tabs**
  (`CohortDetailPageContent.tsx`): each tab (`Assignments`,
  `Submissions`, `Sessions`, `Roster`) lazily mounts and fetches only
  when clicked (confirmed: Base UI's `TabsPanel` has `keepMounted =
  false` by default) — so this is "one query at a time as you
  navigate," not "13 queries at once." This is already fine as
  architecture; just make sure every tab's own skeleton (which mostly
  already exist per-tab) matches its content shape.
- `/payments` and `/refer-and-earn`: **these are NOT widget grids** —
  they read as one coherent view (a payment surface, a referrals
  panel with tabs) where a user reasonably expects everything to
  appear together, not in a random stagger. Add an actual coordinated
  gate here: `const isLoading = q1.isLoading || q2.isLoading || ...`
  and show one skeleton for the whole view (or every visible section)
  until all of that page's own queries have resolved. This is the
  `Promise.allSettled`-style "show it all together" behavior the
  dashboards deliberately should NOT have.
- `/jobs`: minor case — the company-filter dropdown has no skeleton
  while `useJobCompanies` loads (renders an empty dropdown instead).
  Low-impact; add a "Loading companies…" disabled placeholder item if
  cheap to do, don't over-invest here.

The through-line: **a widget-grid dashboard stays staggered (add
missing skeletons, don't add a global gate); a single logical
view/table/list gets a real coordinated gate.** Make this call
explicitly for any page not listed above too, and say which you picked
in the commit message for that page.

### 0.4 — Refresh button coverage

Shared `RefreshButton` (`components/ui/refresh-button.tsx`) already
exists and is used correctly in some places. Two separate problems:

**Missing entirely** on pages that fetch real data:
- `/dashboard` (student view) — ~13 independent queries, zero refresh
  affordance anywhere on the page.
- `/internships` (`InternshipWorkspacePageContent.tsx`)
- `/payments` (`PaymentsPageContent.tsx`)
- `/webinars` (`WebinarsPageContent.tsx`)
- `/calendar` (`CalendarPageContent.tsx`)

**Present, but only refetches ONE of several visible queries** (silently
leaves the rest stale) — this is worse than missing, since it looks
like it works:
- `TeachPageContent.tsx`'s refresh button refetches only
  `useTeachingCohorts`, not `NeedsGradingStrip`, `RecentSubmissionsTile`,
  `UpcomingClassesTile`, or the webinars widget's underlying queries.
- `CohortDetailPageContent.tsx`'s refresh button refetches only
  `useTeachingCohortDetail`, not whichever tab's own query is currently
  active.

**The correct pattern already exists in this codebase — copy it, don't
invent a new one:**
```ts
// JobsPageContent.tsx and ReferralsPanel.tsx already do this right:
onClick={() => Promise.allSettled([refetch(), refetchCompanies()])}
// ReferralsPanel:
onClick={() => Promise.allSettled([refetch(), banking.refetch(), payouts.refetch()])}
```
Apply this same `Promise.allSettled([...])` shape to every refresh
button — new ones and the two broken existing ones — so a refresh
actually refreshes everything visible on that page/section, not just
whichever query happened to get wired up first.

For `/dashboard`'s ~13 widgets: don't wire one refresh button to 13
`refetch()` calls blindly — check whether each widget's hook actually
exposes a stable `refetch` at the page level, or whether some widgets
own their query internally with no way for the page to trigger it.
Where a widget's query isn't reachable from the page, either lift the
hook call up (if cheap) or give that one widget its own small refresh
affordance instead of silently excluding it from the page-level button.

### 0.5 — Debounce

**No shared debounce hook/utility exists anywhere in the codebase.**
Exactly two searches hit the network per keystroke, each with its own
independent, differently-tuned inline `setTimeout`:
- `modules/jobs/components/JobsPageContent.tsx` — 300ms, feeds
  `useJobs`'s queryKey.
- `components/layout/command-palette.tsx` (global ⌘K search) — 200ms,
  feeds `useSearch(q)`, which also correctly uses
  `enabled: trimmed.length >= 2` and `placeholderData: keepPreviousData`.

Every other search/filter input found (assignments list, Courses,
`InstructorAssignmentsList`) filters an **already-fetched in-memory
array** on every keystroke — no network call, so no debounce is needed
there. Don't add debounce to purely client-side array filters; it adds
latency for zero benefit.

**Task:** extract a shared `useDebouncedValue<T>(value: T, delayMs:
number): T` hook (e.g. `hooks/use-debounced-value.ts`). Replace both
existing inline implementations with it, **preserving each one's own
delay** (300ms for jobs, 200ms for command palette) — don't
arbitrarily unify them to one value without a reason. Then **audit the
rest of the app for any other text input that feeds a query key or API
call directly** (the two found above may not be the only ones by the
time you start — re-run the search) and apply the same hook to any you
find. Report what you found, even if it's "just these two, confirmed."

### 0.6 — Prefetching

Absent entirely — no `prefetchQuery`, `prefetchInfiniteQuery`,
`ensureQueryData`, or prefetch-on-hover pattern anywhere. **This is
explicitly lower priority than 0.1–0.5** — it's a genuine UX polish
opportunity (e.g. prefetch a cohort's detail query on sidebar-link
hover) but has its own risk profile (wasted requests on accidental
hovers, cache-key correctness under prefetch) and isn't a bug fix like
the rest of this plan. **Do it last, and only if 0.1–0.5 are fully
done, tested, and committed first.** If you don't get to it, say so
explicitly rather than silently skipping — this is the one section
where "ran out of time, didn't do it" is a completely fine outcome to
report.

---

## 1. Caching policy — give the ad hoc tiers a name

Add a small shared file, e.g. `lib/query-config.ts`:

```ts
export const STALE_TIME = {
  REALTIME: 30 * 1000,      // search/lookahead data, changes constantly
  DEFAULT: 60 * 1000,       // matches the QueryClient global default — most queries
  SLOW: 5 * 60 * 1000,      // changes rarely within a session (catalog, entitlements)
  VERY_SLOW: 30 * 60 * 1000, // effectively static for a session (companies list, etc.)
} as const;
```

Go through the 13 files listed in §0.1 and replace each magic-number
`staleTime` with the matching named constant (`STALE_TIME.SLOW` instead
of `5 * 60 * 1000`, etc.) — **don't change the actual numeric values**,
this is a naming/documentation pass, not a re-tuning pass. If a value
doesn't cleanly fit one of the four tiers, that's a real signal — flag
it in the commit message rather than forcing it into the nearest
bucket. Leave the deliberately-zeroed self-paced playback token as a
literal `0`, not a tier — it's a documented, intentional exception, not
part of the tiering system.

---

## 2. Acceptance

- [ ] `lib/query-config.ts` created with named `STALE_TIME` tiers; all
      13 identified override sites use the named constants.
- [ ] All 3 confirmed invalidation gaps (§0.2, items 1–2 always; item 3
      after checking the backend endpoint) fixed; the 3 query-key
      hygiene issues (hand-typed literals, missing factory) fixed.
- [ ] Every independent query on a page has *some* loading UI (§0.3
      Problem A) — no query silently pops in content with zero
      skeleton/spinner.
- [ ] `/payments` and `/refer-and-earn` get a real coordinated loading
      gate; dashboards and the cohort-workspace tabs are deliberately
      left staggered, with a one-line note in the commit message
      explaining why for any page where the choice isn't obvious.
- [ ] Every page in §0.4's "missing entirely" list gets a working
      refresh button; both broken existing ones
      (`TeachPageContent`, `CohortDetailPageContent`) are fixed to
      `Promise.allSettled` every visible query, matching
      `JobsPageContent`/`ReferralsPanel`'s existing correct pattern.
- [ ] Shared `useDebouncedValue` hook created; both existing inline
      debounce implementations migrated to it with their original
      delays preserved; a fresh audit for any other network-driven
      search input is done and reported (even if the answer is "no
      others found").
- [ ] Prefetching (§0.6) attempted only after everything above is
      done, tested, and committed — explicitly reported as done or
      skipped, not silently dropped.
- [ ] `npx tsc --noEmit` / `npx eslint <changed files>` clean.
- [ ] Commit incrementally, small verified units per §7's discipline —
      this plan touches ~25+ files across many modules, so multiple
      commits grouped by concern (e.g. one for the caching-tier rename,
      one per invalidation fix, one per page's loading-coordination
      fix, one for the debounce hook + migration) are expected and
      preferred over one giant commit.
- [ ] Browser-verify against real data wherever the test account
      (`delightsheriff@gmail.com`) has it: trigger each fixed
      invalidation gap live (grade a submission from a cohort tab and
      confirm the teaching dashboard's count updates without a manual
      refresh; mark attendance and confirm the student's history sheet
      shows it immediately), confirm each new/fixed refresh button
      actually refreshes every visible section, confirm debounced
      searches still return correct results at their original delay.
      Flag, don't silently skip, anything you can't verify live for
      lack of data.
