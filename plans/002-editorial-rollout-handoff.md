# PLAN 002 — Handoff Prompt: Roll "The Brief" Out to the Rest of the App

**Status:** Ready to hand off
**Owner:** SmartHub design system (plan 001 shipped the dashboards; this is the rollout)
**Depends on:** Read `plans/DESIGN-SYSTEM.md` in full first — especially §1 (the
four composition moves), §3 (the primitives), §4 (non-negotiables), §7
(concurrent-agent git discipline) — and read the two reference
implementations named below before touching anything.

---

## 0. Study the reference implementations first

Two pages already ship the new language, live-verified against real
data at desktop/tablet/mobile, in both themes:

- **`app/(app)/dashboard/page.tsx`** (student) — masthead, asymmetric
  hero (continue learning) + ledger (upcoming deadlines), a bento row,
  a magazine-index course list.
- **`modules/teaching/components/TeachPageContent.tsx`** (instructor)
  — same language, teaching-appropriate content (needs-grading hero,
  class-session ledger, cohort index list).

Read both completely before starting. They are the canonical example
of how the primitives compose — copy their patterns, don't reinvent.

## 1. The four moves are a toolkit, not a checklist

Every page does NOT need all four. Use judgment per page:

- **Masthead** (`PageHeader` editorial variant + `dateline`/`divider`
  props) — apply broadly. Almost every top-level page benefits from a
  real headline and a dateline instead of a small title.
- **Asymmetric hero + `Ledger`** — only where a page genuinely has one
  dominant item plus a short list of dated/typed entries. This fits
  naturally on pages like Billing (outstanding balance + payment
  history) or Assignments (most urgent assignment + upcoming list).
  It does NOT fit a pure browse/catalog page — don't force a hero onto
  Jobs or Recordings just because the dashboard has one.
- **Bento tiles** — for pages with several independent small
  widgets/stats. Size tiles by actual importance; never a
  viewport-based `md:grid-colsN` that ignores the container it's
  actually placed in (see §4's cascade-order and container-width notes
  below — both are real bugs found and fixed this session).
- **`IndexList`/`IndexRow`** — any "browse everything" surface: Courses
  catalog, Recordings, Materials, Jobs listing, a cohort's student
  roster. Replaces a grid of boxed cards for content that's really a
  list, not a set of distinct objects.
- **`Ledger`/`NagItem`** — replace a page's own self-gating status rows
  (a "you have an outstanding X" nudge) that currently render as
  independent bordered cards with one shared ledger.

**Not every card is wrong.** A real, distinct object — a course's
hero art, a single detail panel — earns a full `Card`. The bug this
redesign fixed was cards used as row separators for what's really a
list; don't overcorrect into removing every `Card` on principle.

## 2. Two real bugs found this session — don't repeat them

1. **CSS cascade order.** A responsive override (`@media (max-width:
   Npx) { .x { display: none } }`) placed *before* the base rule it's
   meant to override loses silently at every width — same-media,
   equal-specificity CSS resolves by source order, not by which one
   "sounds like an override." Prefer Tailwind's own `sm:`/`md:`
   utilities (`hidden sm:flex`) over hand-written media queries
   entirely — `IndexRow` does this correctly, copy its pattern.
2. **Fixed-width children in a flex header don't shrink.** A
   `w-36 shrink-0` element in the top bar overlapped the logo and got
   clipped by the notification bell on a 375px screen — `shrink-0`
   plus a fixed width that's too wide for the remaining space after
   every sibling is accounted for. If you add anything to `TopBar` or
   any other flex header row, test it at 375px before considering it
   done, not just at your default viewport.

## 3. Pages to migrate

Not yet touched — still on the pre-"Brief" `PageHeader` (no
`dateline`/`divider`) + card-grid pattern:

- Courses (catalog + course detail)
- Assignments (student list + instructor's `/courses` cohort-grouped view)
- Jobs
- Recordings
- Materials
- Billing
- Activity
- Inbox
- Calendar
- Webinars
- Internships
- Payments
- Profile
- Referrals
- The cohort workspace tabs (`CohortDetailPageContent` and its 6 tabs)

**Re-verify this list yourself** — it may have shifted, and a `grep -L
"dateline\|divider" $(grep -rl 'variant="editorial"' modules app
--include="*.tsx")`-style check will confirm which editorial-variant
headers haven't adopted the new masthead props yet.

For each page: read it, decide which of §1's moves actually fit its
content (don't force a hero where there isn't a dominant item), apply
them, and note the decision in your commit message the way plan 001's
commits did ("kept X staggered because Y," "gave Z a hero because W").

## 4. Ground rules

- Read `plans/DESIGN-SYSTEM.md` §7 before starting — commit in small,
  verified units (`git commit -- <exact paths>`, never a bare `git
  commit` or `git add -A`), re-check `git status`/`git diff --stat`
  immediately before each commit.
- `npx tsc --noEmit` / `npx eslint <changed files>` clean before every
  commit.
- **Live-verify every page you touch at desktop, tablet (768px), and
  mobile (375px), in both themes**, against the real test account
  (`delightsheriff@gmail.com`). This is not optional — three real bugs
  (a CSS cascade-order regression, a fixed-width header overlap, and
  an app-wide bottom-nav content-overlap bug) were found this session
  specifically by checking narrow viewports, not by reviewing code.
- Don't invent stats or content a page doesn't actually have data for.
  If a page doesn't have a real "today & upcoming" feed, don't build
  one — that's exactly the kind of fabricated-content mistake the
  brand's own design guidance warns against.
- Update `plans/DESIGN-SYSTEM.md` §3 (migrated/not-yet-migrated lists)
  and §8 (status ledger) as pages ship.

## 5. Acceptance

- [ ] Every page in §3 (or the freshly re-verified equivalent list)
      either migrates to the new language or has a documented reason
      it stays as-is (e.g., a page already scheduled for removal).
- [ ] Every migrated page live-verified at 375px, 768px, and desktop,
      light and dark, against real data — not just reviewed as code.
- [ ] No new hand-written `@media` override placed before the base
      rule it overrides; no new fixed-width flex child untested at
      375px.
- [ ] `plans/DESIGN-SYSTEM.md` updated to reflect what shipped.
- [ ] `npx tsc --noEmit` / `npx eslint` clean throughout; commits are
      small and incremental per §7's discipline.
