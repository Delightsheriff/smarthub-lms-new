# Profile (`/profile`)

Status: ✅ Done — commits `0b29c8a`, `5772188`, `aac86bb`. Full legacy comparison run.

Redesigned with a left settings rail (solid active-state) replacing the
wrapping horizontal `TabsList`, dead "Notifications" settings-row removed
(confirmed dead in legacy too — same bug, carried over), every section
wrapped in a matching `Card` header, `notification-prefs` endpoint path
fixed (was 404ing), `Switch` dark-mode contrast fixed, Student ID row made
always-visible instead of conditionally hidden.

One known, deliberately-deferred gap from this pass: legacy has a
`BirthdayGate` (compulsory birthday capture for instructors) with no
current-codebase equivalent — flagged as a separate spawn_task suggestion
during that session, not yet actioned. See that task if picking it up.
