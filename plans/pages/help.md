# Help (`/help`)

Status: 🟡 Minor gap only

## Current vs legacy

Current: `modules/help/components/HelpPageContent.tsx` (143). Legacy:
`HelpPageContent.tsx` (144). Both are a data-driven, grouped resource
library (video/document/link cards, grouped by category, filtered by
`useEffectiveMode`) — not a static FAQ, not search, not a contact form.
Both already use `PageHeader` (current: `:53-60`) — legacy hand-rolls it,
so current is actually ahead here. `EmptyState` used in current (`:63-67`).
No raw colors, no TODOs, no dead links in either.

## Concrete gap

Legacy's `ResourceCard` renders a `thumbnailUrl` image for document/link
resource types, not just video (legacy `HelpPageContent.tsx:99-109`, via
`next/image`). Current's `ResourceCard` (`:86-143`) only uses `thumbnailUrl`
as the video `poster` attribute — document/link cards never show a
thumbnail even when the API supplies one.

## Acceptance criteria

- [ ] `ResourceCard` renders `thumbnailUrl` for document/link resource types
      too, not just as a video poster.
- [ ] `npx tsc --noEmit` and `npx eslint` clean.
