# SmartHub LMS — Design System Modernization & Auth (Master Context)

This is the **master context** for the second initiative in this repo,
running after (and in parallel with) the original porting project.
Read this first if you're picking up nav/chrome/auth/page-redesign work;
read **`plans/PORTING.md`** if you're picking up a still-open porting
slice. The two tracks share one codebase, one ADR sequence, and one
plan-number sequence — see §6 before creating a new plan file.

> **Status of the other track:** Plans 001–012 (the original 28-module
> port) are done — see `docs/PROGRESS.md`. Plan 013 (Self-Paced
> Learning) landed after that, built by a separate concurrent session —
> see `docs/adr/0017-*.md`. Neither is this track's concern except
> where explicitly noted (e.g. §7).

---

## 1. The goal

Two things, done together, not sequentially:

1. **Restyle the app into a bold, modern, professional product** —
   grouped navigation, solid brand-color active states, real motion,
   consistent shared primitives — instead of the generic shadcn-default
   look the port shipped with. Page by page, starting from the
   smallest surfaces outward (nav chrome first, then Help/Activity/
   Webinars/Notifications/Courses, then the bigger ones: Profile/
   Settings, Referrals, Billing).
2. **Port the client auth system onto NextAuth v5** (Credentials
   provider against the real `smarthub-api`), which turned out to be
   the actual fix for a real, reported bug ("logs out on every
   implementation") — see §5.

**The brand colors are not up for negotiation — the execution around
them is.** ADR 0005 (original port) treated the shadcn `base-vega`
preset's stock magenta as the design language and explicitly refused
the old maroon/orange. ADR 0015 reverses that: the real SmartHub
values — maroon `#430330` (primary), orange `#F29913` (accent) — are
restored, converted precisely to OKLCH, in both themes. Every
modernization in this file happens *with* those colors, doing real
visual work (solid fills, not tints; a real independent accent), not
instead of them.

---

## 2. The design language: two skills, installed, not aspirational

Two skills are installed under `.agents/skills/` (via `npx skills add`,
tracked in `skills-lock.json`) and are meant to be *read*, not just
namechecked:

- **`better-ui`** (jakubkrehel/skills) — the physical-detail checklist:
  concentric border radius, optical alignment, shadows for elevation
  (borders only for structure/state), exact motion values (`scale(0.96)`
  on press, not `0.95`; specific cubic-bezier curves, not approximations).
- **`emil-design-eng`** (emilkowalski/skills) — the animation *decision
  framework*: should this even animate (frequency-based — never animate
  keyboard-initiated or 100+/day actions), what easing (ease-out for
  entering, never ease-in), what duration (<300ms for UI), springs for
  interruptible/gestural motion. The rest of `emilkowalski/skills`
  (`animate`, `apple-design`, `ask-sonner`, etc.) is also installed —
  consult it before hand-rolling any animation.

Also installed: **`better-colors`** (same family as `better-ui`) — for
any future palette/contrast work; **`@shadcn/lint`** — registered in
`eslint.config.mjs` with **zero rules enabled on purpose** (see its own
`SETUP.md`). Turning on `no-raw-colors`/`no-restyle`/`no-arbitrary-values`
once each component's contract is settled is a real, cheap way to make
§4's conventions machine-enforced instead of just written down here.

Motion tokens live in `app/globals.css`'s `:root` block:
`--ease-out-strong`, `--ease-in-out-strong`, `--ease-drawer`,
`--duration-fast/base/modal`.

---

## 3. Shared primitives — use these, don't reinvent them

Every one of these was extracted because the same pattern had already
drifted into 2–4 near-identical copies across pages. Before building a
new page surface, check this list first.

| Primitive | Path | Replaces |
|---|---|---|
| `PageHeader` | `components/layout/page-header.tsx` | Every page's own hand-rolled `<h1 className="text-2xl font-semibold...">` + description paragraph |
| `EmptyState` | `components/ui/empty-state.tsx` | The copy-pasted `rounded-2xl border bg-card p-12 text-center` "nothing here" block |
| `FilterDropdown` / `FilterBar` | `components/ui/filter-dropdown.tsx` | Any page-local filter dropdown (built on shadcn `Select`, not `DropdownMenu` — a filter *picks a value*, it isn't a menu of actions). Bold active-state (tinted border/bg/dot) built in. Has a `loading` prop for query-backed options. |
| `AuthCard` / `AuthCardBody` / `AuthColumn` | `modules/auth/components/AuthCard.tsx` | Every auth screen's own `min-h-screen` + logo + Card boilerplate |
| `Stagger` / `StaggerItem` | `components/animation/stagger.tsx` (pre-existing, now actually used) | Flat, un-animated list/grid pop-in |
| `groupNavItems` | `lib/nav-grouping.ts` | Ad hoc sidebar section grouping (unit-tested — see `tests/nav/grouping.test.ts`) |
| Per-domain type→icon→color maps | `modules/notifications/lib/notification-type.ts`, `modules/activity/lib/action-type.ts` | Duplicated `getIcon()`/`getActionInfo()` switches with raw Tailwind colors. **Pattern, not a single shared file** — two different domains (notification types vs. activity actions) get two small modules, not one forced abstraction. Do the same for a third domain rather than overloading one of these. |
| Chat primitives: `MessageScroller`/`Message`/`Bubble`/`Marker`/`Attachment` | `components/ui/message-scroller.tsx`, `message.tsx`, `bubble.tsx`, `marker.tsx`, `attachment.tsx` | shadcn's official chat components (added 2026-06, see `ui.shadcn.com/docs/changelog/2026-06-chat-components`). Used by Ask Oreo (`modules/oreo/components/OreoPageContent.tsx`). **Gotcha:** `npx shadcn add` generates these importing `cn` from the standalone `cn` npm package, not this repo's `@/lib/utils` — fix that import on every file the CLI touches, and don't let the `cn` package linger as a second, redundant class-merge utility. `@shadcn/react` (the headless scroll/anchoring logic behind `MessageScroller`) is a real, needed dependency — keep it. |

Pages already migrated to this set: Courses, Help, Notifications
(+ `NotificationBell`), Activity, Webinars, both self-paced page-level
surfaces, Profile/Settings, Referrals, Billing, Internships, Oreo,
Assigned-modules, and all four auth screens. Not yet migrated:
Tech Scholarship (no standalone page — dashboard widget only, already
consistent).

---

## 4. Non-negotiables

- **No raw Tailwind palette colors** (`text-emerald-600`,
  `bg-amber-50 dark:bg-amber-950/30`, etc.) for anything semantic.
  Route through theme tokens: `success`, `warning`, `destructive`,
  `primary`, `accent`, `muted`. If a genuinely new semantic category
  doesn't fit an existing token, that's a `better-colors` conversation,
  not a reach for a raw Tailwind shade.
- **Active/selected state is a solid fill**, not a `/10`–`/15` opacity
  tint. This is the single highest-leverage visual change made this
  track (`sidebarMenuButtonVariants` in `components/ui/sidebar.tsx`,
  `BottomNav`, notification badges). A tinted state reads as "maybe
  active"; a solid one doesn't.
- **A filter/value-picker is a `Select`, not a `DropdownMenu`.** The
  latter is for actions, not for choosing one value from a list —
  matters for both correctness (listbox ARIA semantics, arrow-key nav)
  and for keeping `FilterDropdown` as the one implementation.
  Look-alike Radio-group-in-a-DropdownMenu patterns elsewhere in the
  app pre-date this rule; migrate them opportunistically, don't leave
  new ones.
- **One page, one background.** A page component never declares its
  own `min-h-screen`/full-viewport background wrapper if it renders
  inside a layout that already owns one — that exact bug (a second
  nested full-height box, confined to the layout's width, painting a
  visibly different background than the rest of the page) took out
  all four auth screens at once. If a page looks like it has a
  two-tone background, this is almost certainly why.
- **Motion needs a reason** (emil-design-eng §"Animation Decision
  Framework"). Don't add a transition because it's easy to add one;
  answer "should this even animate" first, especially for anything
  triggered often (nav, keyboard shortcuts).
- **Confirm scope before a big slice, same as the porting track.** The
  small per-page passes (Help, Activity, etc.) don't need a `plans/
  0NN-*.md` of their own — they're small enough for a single
  confirm-and-build turn. A cross-cutting slice (nav chrome, auth) does.

---

## 5. Auth architecture (NextAuth v5 / Auth.js)

`next-auth@beta` (5.0.0-beta.x — the App-Router-native version;
`next-auth@latest` resolves to the old v4 API and is the wrong choice
for this stack). Credentials provider only, no OAuth, no adapter —
sessions are JWT-strategy, encrypted in an httpOnly cookie.

- **`auth.ts`** (project root) — the whole server config. `authorize()`
  calls `smarthub-api`'s real `/auth/login` with a **raw `fetch`**, not
  the browser-facing `apiClient` (`lib/api/client.ts`) — that instance
  assumes a browser context (reads the Zustand store via `getState()`,
  calls `sonner` toasts), neither of which is safe or meaningful
  server-side inside a NextAuth route handler. The raw API user object
  is mapped through `toAuthUser()` (the same whitelist function
  everywhere else uses) **before** it ever touches the session token —
  smarthub-api's login response isn't `.select("-password")`'d, so the
  raw document may carry a password hash.
- **No token-refresh logic** — smarthub-api's `generateAccessToken`
  signs with no `expiresIn`, so tokens carry no `exp` claim and never
  expire. A 401 from the API is therefore always a genuinely invalid
  session (suspended, revoked, secret rotated), never "needs a routine
  refresh" — `lib/api/client.ts`'s response interceptor just signs out
  for real (`next-auth/react`'s `signOut`) rather than attempting a
  refresh dance.
- **`AuthSessionBridge`** (`components/providers/auth-session-bridge.tsx`)
  mirrors the NextAuth session into the existing Zustand `authStore` on
  every session change, so the store's ~20 existing consumers (sidebar,
  socket provider, the axios interceptor's `getState()` call outside
  React, etc.) needed zero changes. `authStore` no longer has its own
  `persist` middleware — that would be a second, independent
  persistence layer racing the real session on every load.
- **The root layout (`app/layout.tsx`) is `async` and calls `auth()`
  server-side**, passing the result into `SessionProvider`. This is
  what actually fixes "logs out on every implementation": without a
  server-fetched initial session, `useSession()` starts in a `"loading"`
  state on first client render, and any gate that doesn't explicitly
  wait for `status` (rather than a derived flag that updates a tick
  later) will flash an already-authenticated user to `/login`. See
  `AppShell`'s comment for the exact mechanism.
- Dev-only env (`.env.local`, gitignored): `AUTH_SECRET`, `AUTH_API_URL`
  (the direct backend URL for server-side `auth.ts` — deliberately
  *not* the `/api-proxy` rewrite `NEXT_PUBLIC_API_URL` uses, which
  exists only so the *browser* preview sandbox can reach a second port;
  server-side code has no such restriction), `AUTH_TRUST_HOST`.

---

## 6. Plan-number and ADR-number registry

One shared sequence across both tracks — **check this table, and the
actual `plans/`/`docs/adr/` directories, before picking a number.**

| Plans taken | By |
|---|---|
| 001–012 | Original porting plans |
| 013 | Self-Paced Learning |
| 014 | Navigation chrome redesign (this track) |
| 015 | Editorial design sync from `smarthub-core-client` (this track) — slice 1 (Courses) shipped, see `plans/015-editorial-design-sync.md` |
| 016 | Editorial rollout handoff prompts — per-page prompts for slices 2+, see `plans/016-editorial-rollout-prompts.md` |
| 017 | Handoff prompts: dialog spacing, form standardization (react-hook-form + zod everywhere, backend/legacy validation audit), data-page refresh + coordinated loading — see `plans/017-forms-dialogs-data-pages-prompts.md` |
| 018 | Handoff prompt: fix Select trigger label resolution app-wide (Base UI `Select.Value` doesn't auto-resolve labels) — see `plans/018-select-value-label-fix-prompt.md` |
| 019 | Handoff prompt: data-fetching/caching tiering, cache-invalidation gaps, coordinated vs. staggered loading, refresh-button coverage, shared debounce hook — see `plans/019-data-fetching-caching-loading-prompt.md` |

Follow-ups mentioned for the self-paced track (access-revocation
notices, a jobs/career surface, global search) have since shipped —
`modules/access/components/RevokedCourseNotice.tsx`, `modules/jobs/`,
`modules/search/` + `components/layout/search-trigger.tsx` — as part of
the same pass that produced plan 017. None of them got their own plan
file; **next available plan number is 020.**

| ADRs taken | Decision |
|---|---|
| 0001–0014 | Original porting decisions |
| 0015 | Restore SmartHub brand colors (supersedes 0005) |
| 0016 | Grouped nav + solid active-state fill (extends 0007) |
| 0017 | Self-paced watermarked streaming/entitlement seam |

Next available: ADR **0018**.

---

## 7. Working alongside a concurrent agent session

This codebase has, more than once in this track's history, had a
**second Claude session working on the self-paced port at the same
time**, in the same git working tree. Two real failure modes happened,
not hypothetically:

1. **Git-index race on commit.** `git add <mine>; git commit` picked up
   files the *other* session had staged moments earlier, silently
   bundling their in-progress work into a commit attributed to this
   one. Fix in place: every commit in this track uses
   `git commit -m "..." -- <exact paths>`, never a bare `git commit` and
   never `git add -A`. This limits a commit to exactly the paths named,
   regardless of what else is sitting in the shared index.
2. **Full working-tree wipe.** Once, every uncommitted change across
   *eight tracked files plus four new untracked files* vanished at once
   — almost certainly the other session running `git clean -fd` /
   `checkout .` as part of its own workflow, with no way to know this
   session had uncommitted work sitting in the same tree.
   `git reflog` confirmed no *committed* work was lost, only whatever
   hadn't been committed yet.

**If you're an agent reading this while another session might be
active on the same checkout:** commit early and often, in small
verified units, immediately after each one — don't batch multiple
logical changes into one uncommitted working session. Re-run
`git status`/`git diff --stat` right before every commit, not just
after, since staged content can change between the two. If a file you
just edited reads back with your edit missing, don't assume you
misremembered — check `git reflog` and redo the work; it's very
possibly this exact class of collision, not an error on your part. The
real, durable fix — recommended, not yet actioned — is running
concurrent sessions in separate `git worktree`s instead of one shared
checkout.

---

## 8. Status ledger

| Slice | Status |
|---|---|
| Brand colors restored (ADR 0015) | ✅ Done |
| `@shadcn/lint` registered | ✅ Done (no rules on yet) |
| Plan 014 — nav chrome redesign (grouping, solid active state, collapsible sections, sliding role switcher, header polish) | ✅ Done — see `plans/014-navigation-chrome-redesign.md` |
| NextAuth v5 port | ✅ Done |
| Auth pages full-page-background fix + `AuthCard` extraction | ✅ Done |
| Shared primitives: `PageHeader`, `EmptyState`, `FilterDropdown`/`FilterBar` | ✅ Done |
| Courses, Help, Notifications, Activity, Webinars migrated to shared primitives | ✅ Done |
| Self-paced module: raw-color cleanup + `PageHeader`/`EmptyState` adoption | ✅ Done |
| Profile/Settings redesign | ✅ Done — left settings rail (solid active-state, replaces the wrapping `TabsList`), every section wrapped in a matching `Card` header, dead "Notifications" row removed from Overview, `notification-prefs` endpoint path fixed, `Switch` dark-mode contrast fixed |
| Referrals, Billing, Internships, Oreo, Assigned-modules | ✅ Done — PageHeader/EmptyState adoption throughout; Referrals also moved onto the segmented-header-tabs pattern; Oreo rebuilt on shadcn's new chat primitives (`message-scroller`/`message`/`bubble`) |
| Tech Scholarship | ✅ Already consistent — dashboard-only widget (`TechScholarshipCard`), no standalone page exists |
| Per-page segmented header tabs (the CRM inspiration's "Companies · Active" pattern) | ⬜ Deliberately deferred — a per-page decision, not a chrome concern |
| Full profile "entity drawer" (CRM-style avatar/stat-grid/list panel) | ⬜ Superseded — the left-rail + header-card shape shipped instead; revisit only if a future page specifically needs the CRM stat-grid layout |
| Plan 017 — dialog spacing audit, react-hook-form + zod everywhere, refresh controls + coordinated loading on data pages | ✅ Done and live-verified — see `plans/017-forms-dialogs-data-pages-prompts.md`, `plans/017-validation-audit.md` |
| Plan 018 — Select trigger label resolution + popup positioning | ✅ Done and live-verified (cycled every option on the Courses filters against real data, confirmed correct label + correct filtering each time) — see `plans/018-select-value-label-fix-prompt.md`. Two extra bugs found during this verification and fixed directly: `CohortDetailPageContent`'s 6-tab bar broke onto an ugly full-width row on narrow viewports instead of scrolling (now matches the `overflow-x-auto` pattern already used on Courses/self-paced tabs), and the roster/assignments tabs showed "1 Submissions"/"1 Pending Grade" instead of correct singular grammar. Commit `9cd9b51`. |
| Profile birthday editing | ⬜ Known gap, flagged not fixed — legacy LMS exposes birthday editing and the backend accepts `birthDay`/`birthMonth`, but the current profile screen has no field for it (see `plans/017-validation-audit.md`) |
| Auth screens — disable every input during submit | ✅ Done — the 5 auth screens (Login/ForgotPassword/ResetPassword/AcceptInvitation/ChangePassword) previously only disabled the submit button via `mutation.isPending`, not the fields themselves, contradicting plan 017's own rule. Fixed and live-verified (commit `a429da0`). |
| Plan 019 — data-fetching/caching tiering, invalidation gaps, coordinated loading, refresh coverage, debounce | ⬜ Handoff prompt written, not yet actioned — see `plans/019-data-fetching-caching-loading-prompt.md` |
