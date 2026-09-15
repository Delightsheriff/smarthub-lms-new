# Ask Oreo (`/oreo`)

Status: ✅ Done — commit `54801d6`

Rebuilt on shadcn's new chat primitives (`message-scroller`, `message`,
`bubble`) per explicit request. See `plans/DESIGN-SYSTEM.md` §3 for the
component list and the `cn`-import gotcha their CLI leaves behind.

No legacy-parity audit run on this one yet — it's an AI chat surface unique
to this codebase (legacy doesn't have Oreo in the same form, or if it does,
it wasn't part of this session's scope). If a future pass wants full parity
verification, check `~/Documents/smarthub-projects/smarthub/smarthub-core-lms`
for an equivalent Oreo module first.
