# ADR 0018 — Editorial dashboard composition: masthead/hero-ledger/bento/index-list over uniform card stacks

- **Status:** Accepted
- **Date:** 2026-09 (dashboard redesign)

## Context

The dashboard (both student and instructor) had been restyled onto the
shared "editorial" primitives (`PageHeader`, brand colors, `font-display`
serif headings) as part of the earlier design-system rollout, but its
actual *composition* was still a vertical stack of `<h2> + card-grid>`
sections — six-plus separate bordered cards for status nudges (billing,
referrals, acceptance letters, internship, tech scholarship), each
sharing the identical radius/border/shadow regardless of what it held,
followed by a stats grid, a progress card, a calendar card, and a course
grid, one after another. Applying the same brand colors and serif type
to every section did not fix this: the page still read as a list of
interchangeable boxes, not a considered piece of UI with a real visual
hierarchy.

## Decision

Rebuild the dashboard (both roles) on four composition moves instead of
"restyle every section as its own card":

1. **Masthead** — a dateline (mono, small caps) above a real serif
   headline at real scale, replacing a small `PageHeader` title with a
   genuine hero moment. `PageHeader`'s editorial variant gained
   `dateline`/`divider` props for this, additive so no other page using
   it needed to change.
2. **Asymmetric hero + ledger**, not equal-weight cards. The single
   highest-priority item (continue learning; needs grading) takes a
   dominant ~2/3 slot with real visual weight; a compact,
   hairline-divided `Ledger` of dated/typed entries takes the rest —
   replacing what used to be a separate stats strip, deadlines panel,
   and status-nag grid.
3. **Bento tiles sized by actual importance**, not a uniform
   `md:grid-cols-4` that squeezes tiles into whatever space is left
   regardless of the container they're actually placed in.
4. **Magazine-index lists** for "browse everything" surfaces (courses,
   cohorts) — numbered rows separated by hairlines, replacing a grid of
   boxed cards that competed for the same visual weight as the hero.

New shared primitives: `components/ui/ledger.tsx` (`Ledger`/`LedgerItem`
for dated lists, `NagItem` for a self-gating status/opportunity row
with a colored left rule instead of a full bordered card) and
`components/ui/index-list.tsx` (`IndexList`/`IndexRow`, using Tailwind's
own responsive utilities rather than hand-written media queries).

The six dashboard "nag" widgets (billing, internship fee, internship
workspace, acceptance letters, referrals, tech scholarship) were each
rewritten to render as a `NagItem` row instead of an independent
bordered `Card` — this was the actual fix for "why does this look like
ten identical boxes," not a coat of paint on the existing cards.

Brand colors (ADR 0015) and the solid-fill active nav state (ADR 0016)
are unchanged — this decision is about layout and composition, not
palette.

## Consequences

- **Positive:** the dashboard has a real visual hierarchy — one thing
  is clearly most important, secondary information reads as secondary,
  and "browse everything" surfaces don't compete with the hero for
  attention.
- **Positive:** `NagItem`/`LedgerItem` are cheap to add to, so a new
  self-gating dashboard nudge doesn't reflexively become a new bordered
  card — it becomes one more row in an existing ledger.
- **Negative:** two more shared primitives to learn before building a
  new dashboard-style surface (masthead + hero/ledger is a real pattern
  to internalize, not just "wrap it in a Card").
- **Follow-up:** only the two dashboards have been rebuilt on this
  language so far. Every other page (Courses, Assignments, Jobs,
  Billing, Profile, the cohort workspace, etc.) still uses the earlier
  `PageHeader` + card-grid pattern, which isn't wrong, just not yet
  carrying this language — see `plans/DESIGN-SYSTEM.md` §8 and the
  plan 002 handoff prompt for the rollout.
