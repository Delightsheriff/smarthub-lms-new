# PLAN 002 — Help

Route: `/help` · File: `modules/help/components/HelpPageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state

Masthead applied (guide count in the description). Body: resources
grouped by category, each category a `<section>` with an
`sm:grid-cols-2` `Stagger` grid of `ResourceCard`s (icon chip, title,
description, then either a native `<video>`, a thumbnail `Image`, or
nothing, then a "Read"/"Open" button, then a type `Badge`).

## Direction

Split by resource type — a straight `IndexList` conversion would lose
real information for videos (the thumbnail is the point of a video
resource; a text row can't show it). Two treatments in the same page:

1. **Documents and links** → `IndexList`/`IndexRow` per category: `num`
   (position within category), `title` = resource title, `subtitle` =
   description (truncated), no `progress`, `status` = the resource type
   ("Doc/Link"), row click opens the resource. This is the majority of
   entries in most categories and is currently the worst-served by a
   card grid (a title + one-line description + a button doesn't need a
   bordered box).
2. **Videos** → keep a visual grid, but only for videos — don't grid
   documents/links alongside them anymore. A 2-up (not `sm:grid-cols-2`
   at every category regardless of item count) grid scoped to just the
   video subset per category.
3. If a category has zero videos, it's pure `IndexList` — no empty
   grid section.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Documents/links render as `IndexList` rows, not cards.
- [ ] Videos keep a real visual thumbnail/player, not text rows.
- [ ] A category with only documents/links has no leftover empty video
      grid section.
