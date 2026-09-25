# Handoff: what's left before SmartHub LMS is ready (2026-09-25)

Written so that **any agent can pick up from wherever the last one stopped**.
Read this file first, then `AGENTS.md` and `plans/DESIGN-SYSTEM.md`.
`AUDIT-FIX-PROMPTS.md` holds the original per-slice prompts (F1–Q3). This
file covers current state, merge work in flight, and every remaining task,
written as prompts you can copy.

---

## 0. Rules every agent must follow (copy into any prompt)

```
REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new
(Next.js 16, React 19, shadcn "base-vega" on Base UI, TanStack Query,
NextAuth, vitest). Remote: git@github.com:Delightsheriff/smarthub-lms-new.git (main).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code. This is
NOT the Next.js you know: check node_modules/next/dist/docs/ before you touch
any Next API.

READ-ONLY REFERENCES (never edit, checkout, merge or push):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/)
- Backend contract: ~/Documents/smarthub-projects/smarthub/smarthub-api, on
  branch `dev`. Verify every path, verb and payload against src/routes,
  src/controllers, src/middlewares/validators and src/services.
- NEVER touch the `lms-backend-fixes` branch (the user's own; never merge it).
- NEVER write to any database. The API uses a REMOTE shared Atlas cluster
  (smarthub-dev), not a local DB. If data needs changing, write a script and
  hand it to the user.

COMMITS (strict):
- Small, incremental commits: `git add <paths> && git commit -m "type(scope): summary" -- <paths>`.
- The author is the existing git config (Delight sheriff). NO Co-Authored-By
  trailer, no "Generated with" line, no trailers at all.
- Never `git add -A`, never a bare `git commit`. Push only when the user says so.

GOTCHAS LEARNED THE HARD WAY:
- Do NOT run `npx prettier --write` with the repo config. .prettierrc has
  semi:false and strips semicolons from files that use them. If you must
  format, use `npx prettier --semi --no-config --print-width 100 --write <file>`,
  or format by hand to match the surrounding file.
- ESLint runs the React Compiler rules:
  - use RHF `useWatch`, not `watch()`
  - never call setState synchronously inside useEffect (derive state, or use
    useSyncExternalStore / hooks/use-mobile.ts)
  - drop manual useMemo that the compiler "could not preserve" (plain
    derivations are fine; the compiler memoizes them)
- Base UI Select:
  - `<SelectValue>` shows the RAW value unless you pass a render function:
    `<SelectValue>{(v) => labelFor(v)}</SelectValue>`
  - SelectTrigger forces `capitalize` on its value; add
    `*:data-[slot=select-value]:normal-case` when labels have their own case
- Base UI Button that renders a Link or <a>: `nativeButton={false}` +
  `render={<Link href=… />}`. There is no `asChild`.
- `Ledger` decides "empty" by counting children. Anything always rendered
  inside it (a Pager) breaks the empty state, so put pagers outside.
- `LedgerControlItem` stacks its actions under the title on phones. Pass
  `className="flex-row items-start sm:items-center"` to keep a row menu beside
  the title.
- JSX: text that follows a closing tag on the same line can lose its leading
  space. Use `{" "}` explicitly.
- lib/api/client.ts:
  - `silent` suppresses BOTH the success and the error auto-toasts
  - also has `timeout`, `getPaginated` ({data, meta}), `apiErrorMessage`
    (reads express-validator `errors[].msg`), `uploadFile`, and
    `uploadFileDetailed(file, path, opts)`
  - the API returns an upload's URL as the envelope's `data` STRING
- Teaching authoring writes are `silent`, and the UI shows its own messages
  (errorText() in modules/teaching/components/authoring/authoring-kit.tsx).
- The API rejects due dates that aren't in the future. Use
  `isFutureLocalInput` / `addDaysToLocalInput` from
  modules/teaching/components/authoring/datetime-local.ts.
- Wire shapes: many backend rows carry `_id`. Always normalise to `id` in the
  module's normalise.ts. Never type raw wire rows as UI types (this bug broke
  grading once).
- Dev: the app is on :3000 and proxies /api-proxy → localhost:6001. The socket
  connects directly to 6001 (lib/api/dev-origin.ts). macOS AirPlay owns
  port 5000, which returns a 403.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails). For UI: load the page in the in-app browser
at 375px and desktop, light and dark, and confirm
`document.documentElement.scrollWidth === clientWidth` at 375px. Report each
item as done, partial or blocked, with the commit hash.
```

---

## 1. Current state (verified 2026-09-25)

`main` is at `62e6e41`, and `origin/main` is at `23f7435`. The L1 commits
after that point are **not pushed yet**. All four checks passed at the last
full run (230 tests).

**Done:**
- **Wave 1:** F1 (API client), F2 (auth), F3 (messaging and realtime),
  F4 (endpoint fixes), F5 (submissions and progress), F6 (teaching fixes).
- **Wave 2:**
  - T1: instructor student page, grading brief, deep links.
  - T2: assignment authoring, multi-cohort create, attach existing,
    due-date dialog, row menu.
  - T3: materials and recordings authoring, plus detail pages.
  - T4: module page, module status, cohort switcher, overview shortcuts,
    `?assignment=` filter, roster activity and at-risk filters.
- **Contract bugs fixed along the way:**
  - cohort submission `_id` → `id` (grading targeted `undefined`)
  - `uploadFile` read the wrong field (every upload was broken)
  - the socket pointed at port 5000
  - the visibility switch acted as an unconfirmed detach
  - validation errors showed axios's generic text
  - duplicate toasts

**L1 (student learning) is IN PROGRESS.** Done and committed:
- the content toolbar and filter (`components/ui/content-toolbar.tsx`,
  `modules/learning/utils/content-filter.ts`)
- module-page lists: search, kind and order filters, recordings paged at 10,
  `?recording=` deep link, StatusBadge and shared EmptyState
- course outline: `?recording=` links and a "Show more" reveal of 8
- recordings page: URL `?filter=` via Select, search, per-course paging, hero
  HTML fix
- materials page: opens link-only materials, error state, search, URL filter,
  real buttons, aria-expanded

The rest of L1 is task **N1** below.

---

## 2. MERGE WORK IN FLIGHT (do this first)

Three background agents worked in git worktrees under `.claude/worktrees/`.
Each has its own branch:

| Task | Branch | Path |
|---|---|---|
| B1 scholarship / payments / internships / referrals / jobs | `worktree-agent-a7f23a71328cdfa61` | `.claude/worktrees/agent-a7f23a71328cdfa61` |
| D1 dashboard parity + 24 legacy commits | `worktree-agent-a9ad05408ad8bb38a` | `.claude/worktrees/agent-a9ad05408ad8bb38a` |
| P1 push, PWA, live bell | `worktree-agent-ac0a43dff1c6a1ed1` | `.claude/worktrees/agent-ac0a43dff1c6a1ed1` |

```
TASK M1: Review and merge the three worktree branches into main.

1. For each branch, `git log --oneline main..<branch>` and
   `git diff main...<branch> --stat`. If a worktree still has uncommitted
   changes (`git -C <path> status --short`), the agent didn't finish: note what
   is missing and carry on.
2. Review each diff against its task in AUDIT-FIX-PROMPTS.md (sections B1, D1
   and P1). Check endpoints against smarthub-api `dev`, and check for:
   - `_id` vs `id` normalisation
   - raw palette colours
   - missing error states
   - Base UI Select label/value issues
   - co-author trailers (none are allowed)
3. Merge one at a time: `git merge --no-ff <branch> -m "merge: <task>"` (no
   trailers). The expected conflict is components/layout/app-shell.tsx: D1
   mounts BirthdayGate and B1 mounts ScholarshipPhotoGate. Keep both.
4. After P1 and D1 are both merged, mount PushPermissionPrompt
   (modules/push/components/PushPermissionPrompt.tsx) on the dashboard at the
   TODO marker D1 left. Commit that separately.
5. Run the full checks after each merge. Live-check /dashboard, /payments,
   /refer-and-earn, /internships and /jobs at 375px and desktop.
6. Remove the worktrees: `git worktree remove <path>` (use --force only if they
   are clean and merged), then `git branch -d <branch>`.
7. Add `.claude/worktrees/` to .gitignore if it isn't already there.
8. Push only if the user asks.
```

---

## 3. Remaining feature work

### N1 — Finish L1 (student learning)

```
TASK N1: Finish the remaining L1 items. (Done so far: toolbar/filter,
module-section paging + ?recording=, course outline, recordings page, materials
page. See HANDOFF-NEXT.md §1.)

1. ASSIGNMENT THREAD on the student assignment page
   (modules/assignments/components/assignment-page-content.tsx). Legacy renders
   a per-assignment chat with the course staff below the brief. The new
   AssignmentThread (modules/messaging/components/AssignmentThread.tsx) takes a
   `conversationId`, so first resolve it:
   - endpoint: add `ASSIGNMENT: ${LMS_PREFIX}/conversations/assignment` to
     modules/conversations/config/endpoints.ts
   - backend: POST /lms/conversations/assignment with
     {assignmentId, courseId, moduleId?}, which returns the conversation
     (`_id`). See smarthub-api/src/routes/lms-routes/conversations.lms.routes.ts
     around L23.
   - service: `findOrCreateAssignmentConversation(body)` in
     conversations.service.ts. Make it silent, so no success toast on every
     page view.
   - hook: `useAssignmentConversation({assignmentId, courseId, moduleId})`,
     enabled only when all ids exist, returning the conversation id. Legacy:
     smarthub-core-lms/src/modules/messaging/api/messaging.queries.ts L32.
   - render: inside the reading column after GradeCard, a section headed
     "Questions for your tutor" with `<AssignmentThread conversationId=… />`,
     plus loading and error states. `data.course.id` and `data.module.id` are
     available there.
2. ADD-ON BADGE: normalise `isModuleAddon` in modules/courses/api/normalise.ts
   and add it to the type. Show an "Add-on" Badge on the course card and on the
   course page (legacy: course-card.tsx ~L73, courses/[slug]/page.tsx ~L103).
3. REVOKED NOTICE: render RevokedCourseNotice (it already exists and is used on
   the dashboard) on /courses in CoursesPageContent.
4. UPLOAD LIMITS in modules/assignments/components/submission-form.tsx:
   - use `uploadSizeError` from @/lib/utils (10MB for documents, 25MB for media)
     before uploading
   - `accept` = legacy ACCEPTED_MIME_TYPES:
     "application/pdf,image/png,image/jpeg,image/jpg,application/zip,application/x-ipynb+json,.ipynb,.py,.md,.txt,.docx,.pptx"
   - show the error inline
5. ASSIGNMENT LIST (modules/assignments/components/assignment-list-page-content.tsx):
   - the "urgent" hero is the pending, not-yet-overdue item with the NEAREST due
     date
   - list order: newest due date first on EVERY filter (legacy 7f15823)
   - the status Tabs become a Select synced to `?filter=` (it already reads
     ?filter=; keep that)
6. CURRICULUM DOWNLOAD (modules/courses/api/courses.service.ts ~L28 and its
   caller): use the filename getBlob returns, pass `silent: true`, and toast
   once in the caller.
7. Replace the remaining raw palette colours in the learning module
   (`grep -rnE "(emerald|amber|red|blue|green|neutral)-[0-9]" modules/learning modules/courses modules/assignments`)
   and CourseDetailPageContent.tsx ~L254 with tokens.
Verify on the student side (role switch to Student in the top bar): a course
module page with more than 10 recordings, /recordings?filter=unwatched,
/materials and an assignment page.
```

### N2 — Q2 repo hygiene (the prompt is in AUDIT-FIX-PROMPTS.md "Q2")

Additions to that prompt:
- `.env.example` must also list `NEXT_PUBLIC_SOCKET_URL`, noting "defaults to
  the dev API origin in lib/api/dev-origin.ts".
- Update AGENTS.md: replace the "fully shipped" claim, and point to this file.
- Also update HANDOFF.md: #2 (git remote) is DONE.

### N3 — Glass / motion decision (user decision, not agent work)

HANDOFF.md item 1 is still open. Don't start it without the user's go-ahead.

### N4 — Instructor course-outline sidebar (user decision)

Legacy wraps every `/teach/cohorts/[id]/*` page in a left rail showing the
course outline. The rebuild uses tabs plus the module page instead. Ask the
user before adding it: it is a cross-cutting layout change.

---

## 4. UI consistency and polish sweep (task Q1+, run after M1 and N1)

```
TASK Q1+: Repo-wide UI consistency pass. Behaviour must not change. One commit
per numbered item (or per module for big items).

1. RAW COLOURS → tokens. Find them with:
   grep -rnE "(emerald|amber|red|blue|green|yellow|neutral|slate|zinc|gray|orange|sky)-[0-9]{2,3}|text-white|bg-white|bg-black" app components modules
   components/ui/alert.tsx's warning/info/success variants are known offenders.
   Add a token to globals.css only if one is truly missing, and document it in
   plans/DESIGN-SYSTEM.md.
2. nativeButton: every `<Button render={<Link|<a …>}>` gets `nativeButton={false}`.
   Find them with `grep -rn "render={<Link\|render={<a" app modules components`
   and check each one.
3. CLICKABLE NON-BUTTONS: divs, spans or Badges with onClick become <button>,
   Toggle or ToggleGroup. Known: CourseFilterChips, NotificationBell items
   (unless P1 fixed them), any `cursor-pointer` div.
   Find them with `grep -rn "onClick" … | grep -E "<div|<span|<Badge"`.
4. TABS USED AS FILTERS → Select or FilterDropdown. Known:
   assignment-list-page-content (unless N1 did it), JobsPageContent scope and
   remote toggles (unless B1 did it). Tabs that switch CONTENT (cohort
   workspace, module page) are fine.
5. STATUS PILLS: the remaining raw `<Badge variant=…>` usages (~57) become
   StatusBadge where they are real status pills. Leave icon-chip tints on
   LedgerItem and NagItem alone. List each decision in the report.
6. SELECT LABELS: make the base SelectTrigger stop forcing `capitalize` on its
   value (components/ui/select.tsx, `*:data-[slot=select-value]:capitalize`).
   Audit every Select for lower-case option labels that relied on it, and
   capitalise those labels in data instead. Every Select without a visible
   <Label> gets an aria-label.
7. CARDS AS COSTUMES (design non-negotiable "Not everything is a card"):
   - modules/teaching/components/CohortOverviewTab.tsx "Course Overview" Card →
     a hairline section
   - CohortRosterTab/CohortAssignmentsTab empty states use
     `rounded-2xl border bg-card p-8`; switch them to the shared EmptyState
   - the student assignment page rail cards: a single rail, not stacked cards
8. MOBILE ROWS: every LedgerControlItem whose actions are a single icon button
   or menu gets `className="flex-row items-start sm:items-center"`. Check
   CohortSubmissionsTab, CohortSessionsTab and the internships lists.
9. ARIA:
   - expanders get aria-expanded / aria-controls (RegistrationBillingCard,
     module-section material rows)
   - icon-only buttons get an aria-label
   - Label htmlFor/id pairs on forms
10. RICH TEXT: add a DOMPurify hook in components/ui/rich-text.tsx forcing
    rel="noopener noreferrer" on target=_blank. Add a test.
11. HYDRATION: pages that build a "Tuesday, September 25" dateline with
    `new Date()` at render (dashboard, recordings, materials, assignments,
    tasks) can mismatch between server and client around midnight or across
    timezones. Compute it client-side (useSyncExternalStore or a mounted
    hook), or accept suppressHydrationWarning on that one element only.
12. INPUT SIZES: text-xs Inputs are below 16px, which makes iOS zoom. Grep for
    `<Input[^>]*text-xs` and move them to the default size (auth was already
    fixed).
13. DEAD CODE: components/layout/coming-soon.tsx if nothing imports it
    (`grep -rn coming-soon app modules components`).
14. ORANGE TEXT: `text-accent` on light backgrounds fails WCAG AA. Use
    text-primary for small text, and keep accent for fills. MEASURE contrast by
    rendering to a canvas in the browser; don't compute it by hand.
15. 375px SWEEP: finish with a scrollWidth check on EVERY top-level route, in
    light and dark, both roles (Student and Teaching). Report a table of the
    results.
```

---

## 5. Improvements beyond legacy (Q3, do last)

AUDIT-FIX-PROMPTS.md "Q3" still applies. Already done (skip these): Save &
next ungraded, prev/next student, the at-risk roster filter, and `?filter=`
deep links for recordings and materials.

Remaining:
- a sticky rail on the student assignment page
- a "Resume" pointer from progress
- optimistic message sends with retry
- notifications grouped by day, plus an Unread filter
- command palette: `shouldFilter={false}`, the abort signal, recent pages
- billing: a Pay CTA and receipt links
- an ICS "Add to calendar" download
- `navigator.share` for sharing
- expand/collapse motion with reduced-motion respected

---

## 6. Suggested order for the next agent

1. **M1**: merge the worktrees, mount PushPermissionPrompt, run checks, and ask
   whether to push.
2. **N1**: finish L1.
3. **N2**: repo hygiene (.env.example, README, CI, headers, Sentry, AGENTS.md).
4. **Q1+**: UI consistency sweep.
5. **Q3**: improvements.
6. Ask the user about N3 (glass) and N4 (the outline rail).
