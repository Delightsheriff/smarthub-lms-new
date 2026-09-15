# Webinars (`/webinars`)

Status: ✅ Done

## Current vs legacy

Current: `modules/webinars/components/WebinarsPageContent.tsx` (93) +
`WebinarCard.tsx` (131). Legacy: `WebinarsPageContent.tsx` (262, `WebinarCard`
inlined in the same file).

Join/watch link logic (`isJoinWindowOpen`, `webinarStatus`) is functionally
identical (diff is comment-only). Current's card even improves on legacy —
better "Join link opens 10m before" messaging vs. legacy's static "Link not
yet available", plus a description line legacy's card lacks. No registration/
RSVP flow in either (both are join-link-only) — not a gap, a shared design.
Current already uses `PageHeader`/`EmptyState`.

## Concrete gaps

1. **Tab/page state lost URL persistence.** Legacy keeps `?tab=past&page=N`
   in the URL (legacy `WebinarsPageContent.tsx:23-40`). Current's
   `activeTab` is a bare `useState` — resets to Upcoming on refresh, no
   `?page=` at all.
2. **Past-webinars pagination is gone entirely.** Legacy's `PastGrid` has
   Previous/Next tied to `data.meta.totalPages` (legacy `:104-168`). Current
   fetches a single fixed page (`useWebinars("past", { page: 1, pageSize: 12
   })`) with no pager — anything past the first 12 recordings is
   unreachable in the UI even if the API has more.
3. Raw Tailwind colors: `WebinarCard.tsx:25` (`bg-red-600` "Live Now" badge),
   `:31` (`bg-blue-100 text-blue-800...` "Upcoming" badge) — legacy uses
   `Badge variant="accent"` for live status instead.

## Acceptance criteria

- [ ] `?tab=` and `?page=` persist in the URL for the Past-webinars view.
- [ ] Pagination (Previous/Next) added to the Past-webinars grid.
- [ ] "Live Now" and "Upcoming" badges use theme tokens (`destructive`/
      `warning`/`accent` as appropriate), not raw red/blue.
- [ ] `npx tsc --noEmit` and `npx eslint` clean.
