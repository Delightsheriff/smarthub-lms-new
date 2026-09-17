# PLAN 003 — Assigned Modules

Route: `/assigned` · File: `modules/assigned-modules/components/AssignedModulesPageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state

Masthead applied (module count in dateline). Body: an `Accordion`,
each module a bordered `AccordionItem` — closed state shows title +
duration + recording/material/task counts; open state reveals
description, an instructor note, learning objectives, and three
sub-sections (Recordings/Materials/Tasks, each its own small list).

## Direction

The accordion interaction is correct — these modules carry genuinely
substantial sub-content, so progressive disclosure isn't wrong. What's
wrong is the *closed* row having the same bordered-card weight as
everything else on every other page:

1. Closed rows become `IndexList`/`IndexRow`-shaped: numbered,
   hairline-divided, `subtitle` = duration + counts, `status` unused
   or "N tasks" if that reads better than the status slot. The
   accordion's expand/collapse behavior stays — this is a visual
   restyle of the trigger row, not a removal of the accordion.
2. The *expanded* content keeps a real bordered panel underneath the
   row (it's substantial enough to earn one) — don't flatten the
   actual lesson content, just the closed browsing state.
3. Sub-sections inside the expanded panel (Recordings/Materials/Tasks)
   are already using `RecordingsSection`/`MaterialsSection` from the
   learning module — leave those alone unless plan 012/013
   (Recordings/Materials) changes their shared rendering, in which
   case this page inherits that change for free.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Closed accordion rows read as a magazine index (numbered,
      hairline), not a stack of bordered cards.
- [ ] Expanded content still gets a real panel — not flattened.
- [ ] Accordion expand/collapse behavior unchanged.
