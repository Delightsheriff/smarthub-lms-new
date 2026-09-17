# PLAN 022 — Inbox

Route: `/inbox` · File: `modules/conversations/components/InboxPageContent.tsx`
Read `plans/000-index.md` first (ground rules + acceptance, shared).

## Current state (read in full)

Masthead applied, with a 6-way type filter `Tabs` in header actions.
Layout is a two-pane split (`md:grid-cols-12`, roughly 5/7): left is a
scrollable list of `ConversationListItemRow`s, right is the active
thread (`AssignmentThread`) or an empty-state placeholder.

## Direction

**This is not a browse-everything page — leave the two-pane shell
alone.** `IndexList` doesn't fit the left column as-is: it has no
numbering/progress concept, and it needs to stay a fixed-height
scrollable rail next to the thread pane, not a page-width numbered
list. The real, more modest change: restyle `ConversationListItemRow`
to use hairline dividers between rows (`border-t border-border`, no
individual card border/shadow per row) instead of whatever boxed
treatment it currently has — borrow `Ledger`'s row *aesthetic*
(hairlines, tight vertical rhythm) without adopting the `Ledger`
component itself, since the row's unread/preview/timestamp shape
doesn't map cleanly onto `LedgerItem`'s title/meta/when slots without
awkward compromises. Read `ConversationListItemRow`'s actual current
markup before deciding whether it's already hairline-based or truly
boxed — this plan was written from the shell, not that row component.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] `ConversationListItemRow` re-read fresh; confirmed boxed vs.
      already-hairline before changing anything.
- [ ] If boxed: converted to hairline-divided rows matching the
      `Ledger` aesthetic, without forcing the `Ledger` component itself.
- [ ] Two-pane shell, thread view, and empty-state behavior unchanged.
