# SmartHub LMS — Design System (Master Context)

This is the **master context** for the design system. Read this first
for anything involving nav/chrome, page layout, shared UI primitives,
colors, motion, or auth.

**This file was rewritten from scratch** when the dashboard was
redesigned into "The Brief" — a masthead/hero-ledger/bento/magazine-
index layout language, replacing the earlier approach of restyling
every page as a stack of equal-weight bordered cards. Everything
`plans/0NN-*.md` documented about that earlier rollout (select fixes,
form standardization, data-fetching audits) is still true of the code
it touched and isn't being redone — only the page-layout language
changed. If you find a stale reference to an old plan number anywhere
in this repo, this file and the actual code are the current word, not
the old doc.

The original 28-module port (and Self-Paced Learning) is done and
fully shipped — `plans/ARCHITECTURE.md` still carries its timeless
module/seam vocabulary, which doesn't change with the UI.

---

## 1. The goal

**A distinctive editorial layout language, not a generic dashboard
template.** The brand colors were never the problem — maroon `#430330`
(primary) / orange `#F29913` (accent), restored by ADR 0015, are not
up for renegotiation. What was wrong was composition: every page was a
vertical stack of `<h2> + card-grid>` sections, each card sharing the
same radius/border/shadow regardless of what it held — a dashboard
that read as a list, not a considered piece of UI.

**"The Brief"** is the fix: a real visual hierarchy built from four
moves, applied consistently but never mechanically —

1. **Masthead, not a header bar.** A dateline (mono, small caps) above
   a real serif headline at real scale (`clamp(30px, 4.4vw, 48px)`
   territory) — see `PageHeader`'s `dateline`/`divider` props (§3).
2. **Asymmetric hero + ledger**, not equal-weight cards. The single
   most important thing on the page (continue learning; needs grading)
   takes a dominant ~2/3 slot; a compact, hairline-divided ledger of
   dated/typed entries takes the rest — see `Ledger`/`LedgerItem` (§3).
3. **Bento tiles sized by actual importance**, not a uniform grid —
   Tailwind grid-cols/spans that vary per tile, never `md:grid-cols-4`
   forcing four tiles into whatever space happens to be left.
4. **Magazine-index lists** for "browse everything" surfaces (courses,
   cohorts) — numbered rows separated by hairlines, not a grid of
   boxed cards competing for the same visual weight as real content —
   see `IndexList`/`IndexRow` (§3).

Auth is on NextAuth v5 (Credentials provider against the real
`smarthub-api`) — see §5. Unrelated to the layout work, still current.

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
  interruptible/gestural motion.

Also installed: **`better-colors`**; **`@shadcn/lint`** — registered in
`eslint.config.mjs` with **zero rules enabled on purpose** (see its own
`SETUP.md`).

Motion tokens live in `app/globals.css`'s `:root` block:
`--ease-out-strong`, `--ease-in-out-strong`, `--ease-drawer`,
`--duration-fast/base/modal`.

---

## 3. Shared primitives — use these, don't reinvent them

| Primitive | Path | For |
|---|---|---|
| `PageHeader` (editorial variant) | `components/layout/page-header.tsx` | The masthead. New `dateline` prop (mono uppercase line above the title, e.g. "Tuesday, Sep 17 · Data Science Cohort") and `divider` prop (hairline rule under the whole block) are additive — every other editorial-variant page that doesn't pass them renders exactly as before. `description` now takes `ReactNode`, not just `string`, so a page can bold a number inline (`<strong>{n}</strong> courses...`). |
| `Ledger` / `LedgerItem` / `NagItem` | `components/ui/ledger.tsx` | A hairline-divided list of dated/typed entries ("Today & upcoming", "Needs grading") or self-gating status/opportunity rows ("Needs a look" — billing, referrals, etc.). `LedgerItem` takes `href` (link) or `onClick` (e.g. opening a dialog); `NagItem` has a colored left rule for urgency instead of a dot, plus an `actions` escape hatch for a row needing more than one action. |
| `IndexList` / `IndexRow` | `components/ui/index-list.tsx` | A magazine-index browse list (courses, cohorts) — numbered rows, hairline dividers, progress rule + status that hide below 720px via Tailwind's own `sm:` utilities (not hand-written media queries — see the cascade-order note in §4). |
| `EmptyState` | `components/ui/empty-state.tsx` | The "nothing here" block. Unchanged. |
| `FilterDropdown` / `FilterBar` | `components/ui/filter-dropdown.tsx` | Any page-local filter dropdown (built on `Select`, not `DropdownMenu`). Unchanged. |
| `AuthCard` / `AuthCardBody` / `AuthColumn` | `modules/auth/components/AuthCard.tsx` | Auth screen shell. Unchanged. |
| `groupNavItems` | `lib/nav-grouping.ts` | Sidebar section grouping. Unchanged. |

**Shipped on this language so far:** the student dashboard
(`app/(app)/dashboard/page.tsx`) and the instructor dashboard
(`modules/teaching/components/TeachPageContent.tsx`), both roles fully
rebuilt — masthead, hero+ledger, bento row, magazine-index list. The
six student dashboard "nag" widgets (billing, internship fee/workspace,
acceptance letters, referrals, tech scholarship) were rewritten to
render as `NagItem` rows inside one ledger instead of six separate
bordered cards. The top bar's redundant greeting was removed (the
masthead owns it now) and the sidebar header got a hairline divider to
match the new rule-based motif.

**Not yet migrated** (candidates for the next slice — see §6):
Courses, Assignments, Jobs, Recordings, Materials, Billing, Activity,
Inbox, Calendar, Webinars, Internships, Payments, Profile, Referrals,
the cohort workspace tabs. These still use the pre-"Brief" `PageHeader`
(no dateline/divider) + card-grid pattern, which is not *wrong*, just
not yet carrying the new language.

---

## 4. Non-negotiables

- **No raw Tailwind palette colors** for anything semantic. Route
  through theme tokens: `success`, `warning`, `destructive`, `primary`,
  `accent`, `muted`.
- **Active/selected state is a solid fill**, not a tint (`sidebarMenuButtonVariants`,
  `BottomNav`, notification badges). Unchanged, still correct — the
  editorial redesign did not touch this.
- **A filter/value-picker is a `Select`, not a `DropdownMenu`.**
- **One page, one background.** A page component never declares its
  own `min-h-screen` wrapper if it renders inside a layout that
  already owns one.
- **Not everything is a card.** A hairline (`border-t border-border`)
  is enough separation for a row in a list; reach for a full bordered
  `Card` only for something that's genuinely a distinct object (the
  hero, a bento tile) — stamping the same radius/border/shadow on
  every block is exactly the flattened-hierarchy bug this redesign
  fixed. Before adding a new boxed card to a page, ask whether it's
  actually a list row wearing a card as a costume.
- **A responsive override lives after the rule it overrides**, or use
  Tailwind's own `sm:`/`md:` utilities instead of hand-written media
  queries. A real bug this session: a `@media (max-width: 720px)` block
  placed *before* the base `display: flex` rule it meant to override
  lost silently at every width, because equal-specificity same-media
  CSS resolves by source order, not by which one "sounds newer."
  `IndexRow` avoids this entirely by using `hidden sm:flex` etc.
- **Motion needs a reason.**
- **Confirm scope before a big slice.** A cross-cutting layout change
  (a new page-layout direction, nav chrome, auth) gets its own
  `plans/0NN-*.md`, confirmed by the user before code. A small
  single-page pass doesn't need one.

---

## 5. Auth architecture (NextAuth v5 / Auth.js)

Unrelated to the layout work — still current as originally written.

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
  session, never "needs a routine refresh" — `lib/api/client.ts`'s
  response interceptor just signs out for real rather than attempting
  a refresh dance.
- **`AuthSessionBridge`** mirrors the NextAuth session into the
  existing Zustand `authStore` on every session change, so the store's
  ~20 existing consumers needed zero changes. `authStore` no longer has
  its own `persist` middleware.
- **The root layout (`app/layout.tsx`) is `async` and calls `auth()`
  server-side**, passing the result into `SessionProvider` — this is
  what fixes "logs out on every reload." See `AppShell`'s comment for
  the exact mechanism.
- Dev-only env (`.env.local`, gitignored): `AUTH_SECRET`, `AUTH_API_URL`,
  `AUTH_TRUST_HOST`.

---

## 6. Plan-number and ADR-number registry

**Renumbered from scratch** alongside this file's rewrite — the old
001–019 sequence documented the porting project and the pre-"Brief"
rollout, both superseded. Starting fresh at 001 for the editorial
dashboard system era.

| Plans taken | By |
|---|---|
| 001 | Editorial dashboard system — masthead/hero-ledger/bento/index-list, both dashboards, header/sidebar complement (this slice) |
| 002 | Handoff prompt: roll "The Brief" out to the rest of the app — see `plans/002-editorial-rollout-handoff.md` |
| 003 | Editorial rollout phase 1: core academic & learning surfaces — see `plans/003-editorial-rollout-phase1.md` |
| 004 | Editorial modernization: Oreo AI & final unmigrated surfaces — see `plans/004-editorial-rollout-phase2-oreo-and-remaining.md` |

Next available plan number: **005**.

| ADRs taken | Decision |
|---|---|
| 0001–0014 | Original porting decisions (module seams, state split, routing, auth flows — all still accurate, unrelated to visual design) |
| 0015 | Restore SmartHub brand colors (supersedes 0005) — still accurate, unchanged by this redesign |
| 0016 | Grouped nav + solid active-state fill (extends 0007) — still accurate, unchanged by this redesign |
| 0017 | Self-paced watermarked streaming/entitlement seam |
| 0018 | Editorial dashboard composition — masthead/hero-ledger/bento/magazine-index over uniform card stacks |

Next available ADR: **0019**.

---

## 7. Working alongside a concurrent agent session

This codebase has, more than once, had a **second Claude session
working on it at the same time**, in the same git working tree. Two
real failure modes happened, not hypothetically:

1. **Git-index race on commit.** `git add <mine>; git commit` picked up
   files the *other* session had staged moments earlier, silently
   bundling their in-progress work into a commit attributed to this
   one. Fix in place: every commit uses `git commit -m "..." -- <exact
   paths>`, never a bare `git commit` and never `git add -A`.
2. **Full working-tree wipe.** Once, every uncommitted change across
   eight tracked files plus four new untracked files vanished at once
   — almost certainly the other session running `git clean -fd` /
   `checkout .`. `git reflog` confirmed no *committed* work was lost.

**If you're an agent reading this while another session might be
active on the same checkout:** commit early and often, in small
verified units. Re-run `git status`/`git diff --stat` right before
every commit, not just after. If a file you just edited reads back
with your edit missing, check `git reflog` before assuming you
misremembered.

---

## 8. Status ledger

| Slice | Status |
|---|---|
| Student dashboard rebuilt on "The Brief" (masthead, hero+ledger, bento, magazine index-list) | ✅ Done, live-verified against real data, desktop/tablet/mobile |
| Instructor dashboard (`TeachPageContent`) rebuilt on the same language | ✅ Done, live-verified — grading dialog interaction re-tested and confirmed working through the new `LedgerItem onClick` |
| Six dashboard nag widgets → `NagItem` rows in one ledger | ✅ Done |
| `PageHeader` `dateline`/`divider` props, `Ledger`/`LedgerItem`/`NagItem`, `IndexList`/`IndexRow` | ✅ Done — new primitives, additive to `PageHeader` |
| Top bar redundant greeting removed; sidebar header divider added | ✅ Done |
| App-wide mobile bug: `<main>` had no bottom padding for the `fixed` `BottomNav`, covering the last bit of every page's content on mobile | ✅ Fixed (found while verifying the dashboard redesign) |
| `DashboardStatsStrip` tiles restyled to match `ProgressPulseCard`'s tile shape, off a viewport-based `md:grid-cols-4` that squeezed into a narrow bento column | ✅ Done |
| Role switcher moved from sidebar header to top bar (always visible, icon-only below `sm:`) | ✅ Done — shrinks the sidebar rail, fixed a real mobile overlap regression found while verifying |
| Bento tile rhythm (`ProgressPulseCard` / `DashboardStatsStrip`) unified — same header treatment, same 2-col grid, no more 3-across truncation, no more one-tile-has-a-gradient inconsistency | ✅ Done |
| Rollout to remaining pages (Courses, Assignments, Jobs, Recordings, Materials, Billing, Activity, Inbox, Calendar, Webinars, Internships, Payments, Profile, Referrals, Cohort workspace) | ✅ Done — all 15 core surfaces migrated to "The Brief" editorial mastheads, responsive grids (preventing tablet squeeze), and mobile-safe controls (Plan 003) |
| Editorial modernization of Oreo AI & final unmigrated surfaces (Oreo AI, Help Library, Notifications, Assigned Modules, Self-Paced Learning Catalog, Instructor Self-Paced Portal, Instructor Earnings, Cohort Earnings Detail, Internship Fee Payment, Session Attendance, and Academic Detail pages) | ✅ Done — 100% application surface area migrated to "The Brief" editorial design language with tablet/mobile responsive protection and brand tokens (Plan 004) |
