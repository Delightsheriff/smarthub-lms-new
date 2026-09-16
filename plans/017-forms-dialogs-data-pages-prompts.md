# PLAN 017 — Handoff Prompts: Dialog Spacing, Form Standardization, Data-Page Refresh

**Status:** Ready to hand off
**Owner:** SmartHub design-system modernization (same track as Plans 014–016)
**Depends on:** Nothing structurally, but read `plans/DESIGN-SYSTEM.md` §4
(non-negotiables) and `plans/016-editorial-rollout-prompts.md` §1–2
(required reading + ground rules) first — the same git-collision
discipline, verification workflow, and "narrative vs dense" restraint
apply here.

This file is two independent, self-contained prompts. Hand each to a
fresh agent on its own. **Slice A is small and mechanical — do it
first and ship it before starting Slice B**, which is a genuinely
bigger investigation-plus-implementation job.

---

## Slice A — Dialog/modal button spacing audit

**Trigger:** A real bug found and fixed this session: `submission-
form.tsx`'s `<DialogFooter className="gap-2 sm:gap-0">` zeroed out the
shared `DialogFooter`'s button gap at desktop width, so "Cancel" and
"Confirm & Submit" rendered touching each other. Fixed there (now
`sm:gap-3`, commit `157dedf`) — but the same class of mistake (a
per-dialog override that fights the shared component's spacing) could
exist elsewhere, and every dialog should be checked, not just the one
that happened to get clicked this session.

**Read first:** `components/ui/dialog.tsx` — `DialogFooter`'s own
default is `"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"`.
That's the correct baseline. Also check `components/ui/alert-dialog.tsx`
for its own footer default (same idea, verify it separately — don't
assume it's identical).

**Every file using `Dialog`/`AlertDialog` as of this writing** (grep
`from "@/components/ui/dialog"` / `from "@/components/ui/alert-dialog"`
to catch any added since):

- `app/(app)/profile/page-content.tsx`
- `components/layout/user-menu.tsx`
- `components/ui/command.tsx`
- `modules/acceptance-letters/components/EditSiwesDurationDialog.tsx`
- `modules/assignments/components/submission-form.tsx` (already fixed)
- `modules/calendar/components/EventDetailDialog.tsx`
- `modules/internships/components/InternshipWorkspacePageContent.tsx`
- `modules/internships/components/payment/InternshipPaymentPageContent.tsx`
- `modules/learning/components/material-preview-dialog.tsx`
- `modules/learning/components/recording-player-dialog.tsx`
- `modules/profile/components/AttendancePinSection.tsx`
- `modules/profile/components/AvatarUploader.tsx`
- `modules/profile/components/EditProfileDetailsDialog.tsx`
- `modules/profile/components/ProfilePhotoGate.tsx`
- `modules/self-paced/components/InstructorReferralLinks.tsx`
- `modules/self-paced/components/LessonPlayerPageContent.tsx`
- `modules/teaching/components/GradingDialog.tsx` (footer is a raw
  `<div>` with `gap-2`, not `DialogFooter` — check whether it should
  be converted to `DialogFooter` for consistency, or whether `gap-2`
  on a raw div is intentionally tighter; use judgment, don't force
  every dialog into an identical footer if the content genuinely
  differs)
- `modules/tech-scholarship/components/ShareMilestoneDialog.tsx`

**For each file:**
1. Find its footer/action-button row.
2. If it uses `DialogFooter`/`AlertDialogFooter` with a `className`
   override, check whether that override fights the shared gap. Remove
   overrides that zero or shrink the gap below `gap-2` (8px) at any
   breakpoint, unless there's a genuine reason documented in a comment.
3. If it hand-rolls a `<div className="flex ... gap-N">` instead of
   using the shared Footer component, consider switching to the shared
   one for consistency — but only if doing so doesn't break a layout
   that has a real reason to differ (e.g., a footer with a left-aligned
   secondary action plus right-aligned primary actions).
4. Screenshot before/after each one you touch.

**Acceptance:**
- [ ] Every dialog's action buttons have visible, consistent spacing
      (`gap-2` minimum) at every breakpoint.
- [ ] No dialog regressed visually in ways unrelated to spacing.
- [ ] `npx tsc --noEmit` / `npx eslint <changed files>` clean.
- [ ] One commit, listing every file touched in the message.

---

## Slice B — Form standardization, backend validation audit, data-page refresh + coordinated loading

This is a real investigation, not a mechanical pass. Do the reading in
§B.0 before writing any code — the goal is to match what's *already
correct* in this codebase (the auth screens) and extend it, not invent
a new pattern.

### B.0 — Required reading, in order

1. **The reference implementation already in this codebase**: `modules/
   auth/components/LoginPageContent.tsx`, `ForgotPasswordForm.tsx`,
   `ResetPasswordForm.tsx`, `ChangePasswordForm.tsx`,
   `AcceptInvitationPageContent.tsx`. These five are the *only* forms in
   the entire app currently using `react-hook-form` + `zodResolver` +
   a `zod` schema. This is the target pattern — study exactly how they
   structure the schema, the `useForm` call, error display, and submit
   handling before touching anything else.
2. **Every other form-like component** (plain `useState` + manual
   `onChange`/`onSubmit`, no schema validation) — found via `grep -rl
   "onSubmit=\|handleSubmit" modules --include="*.tsx"` combined with
   the Dialog list from Slice A. As of this writing, roughly 9 of ~14
   form-shaped components in the app are NOT using `react-hook-form`:
   `submission-form.tsx`, `GradingDialog.tsx`,
   `EditProfileDetailsDialog.tsx`, `EditSiwesDurationDialog.tsx`,
   `ShareMilestoneDialog.tsx`, `AttendancePinSection.tsx`,
   `AvatarUploader.tsx`, `StudentAttendanceSheet.tsx`, and the
   internship payment-proof form in
   `InternshipPaymentPageContent.tsx`/`PaymentsPageContent.tsx`. **Verify
   this list yourself — it may have shifted, and there may be forms
   this grep missed** (anything building a payload object by hand from
   several `useState` calls and POSTing it counts as a form for this
   purpose, even with no literal `<form>` tag).
3. **The legacy LMS**: `~/Documents/smarthub-projects/smarthub/
   smarthub-core-lms` — read-only reference. Check how equivalent forms
   there handle validation, submit-disabling, and error display. It may
   predate the current design entirely, or it may have a validation
   convention worth carrying forward (a validation-message copy style,
   a specific set of rules for a field like phone/matric-number/score,
   etc.) — the point is to not reinvent something that already has a
   settled answer, and to catch any validation RULE (not just pattern)
   that the current port might have silently dropped.
4. **The backend**: `~/Documents/smarthub-projects/smarthub/
   smarthub-api` — for every endpoint one of the ~9 non-RHF forms in
   §B.0.2 calls, read the corresponding validator
   (`src/middlewares/validators/*.ts`) and/or Joi/zod schema on the
   backend. The goal: the frontend's zod schema for a given form should
   enforce **at least** what the backend already enforces (required
   fields, string length limits, number ranges, enum values) — so a
   user gets an inline error instead of a round-trip 400. Document any
   MISMATCH you find (backend requires something the frontend doesn't
   check, or vice versa) even if you don't fix every one in this pass —
   note it in the commit message or a follow-up.

### B.1 — The four things every form must do, based on B.0's reference pattern

1. **`react-hook-form` + `zodResolver` + a `zod` schema**, matching the
   auth screens' shape. The schema lives inline in the component file
   for a small form (matching the existing pattern), or in a sibling
   `<name>.schema.ts` if the component is already large — use judgment,
   don't force a new file-splitting convention the codebase doesn't
   already have.
2. **On submit: disable every input** (not just the submit button) —
   `disabled={form.formState.isSubmitting}` on each field, matching
   what a user expects when a network request is in flight (can't edit
   a field mid-submit and have that edit silently lost or cause a
   stale-data mismatch).
3. **After a successful submit: reset the form** —
   `form.reset()` (or `form.reset(defaultValues)` if the form should
   return to specific defaults rather than empty) — so a re-opened
   dialog doesn't show the previous submission's stale values. On
   FAILED submit, do NOT reset — the user's input should stay so they
   can fix and retry.
4. **Errors render inline per-field**, matching the auth screens'
   pattern (not a single toast for a validation error — toasts are for
   submit-level failures like a network error or a 500, inline messages
   are for "this field is wrong").

### B.2 — Data-intensive pages: refresh button + coordinated loading

**The ask:** on pages that fetch and list real data (not narrative
pages), add a refresh control next to the filter row, and make sure
loading states don't pop in piecemeal — either all the data a page
needs is ready and shown together (skeletons the whole time it isn't),
or each section has its own honest skeleton, not a mix of "some content
flashed in already, some still loading."

**Known data-intensive pages as of this writing** (verify + extend this
list, don't treat it as exhaustive):
- `/assignments` (student list), `/jobs`, `/recordings`, `/materials`,
  `/billing`, `/activity`, `/inbox`/notifications
- Cohort workspace tabs: `Assignments & Schedules`, `Submissions &
  Grading`, `Student Roster` (`CohortDetailPageContent.tsx`)
- Teaching dashboard's `Needs grading` / `Recent submissions` panels
- `/refer-and-earn`'s earnings/history tables

**For each:**
1. Add a refresh button (icon button, e.g. `RotateCw` from
   `lucide-react`) next to the existing filter row — if the page has no
   filter row yet, place it next to the page header's actions slot.
2. Wire it to force-refetch every query that page depends on — for a
   page with multiple independent queries (e.g., the cohort workspace
   tabs, or a dashboard with several widgets), use
   `Promise.allSettled([...refetch calls])` so one failing query
   doesn't block the others from refreshing, and show a single
   consistent loading state (skeletons) across all of them while any
   are in flight — not each section independently popping in as its
   own query resolves, if the current implementation does that.
3. If a page currently renders section-by-section as each independent
   query resolves (check with the browser's network tab — do requests
   fire in parallel but render as each one lands, at different times?),
   decide per-page whether that's actually fine (a dashboard with
   clearly separate widgets, where staggered loading reads as normal)
   or worth coordinating into one skeleton-then-reveal-together moment
   (a single logical view like a table or list, where partial render
   reads as broken/buggy). Use judgment — don't mechanically force
   every multi-query page into one big skeleton if the current
   staggered behavior is actually the better UX for that specific page.

**Acceptance for B.1 (forms):**
- [ ] Every form listed in §B.0.2 (plus any others found) uses
      `react-hook-form` + `zodResolver`, matching the auth screens'
      pattern.
- [ ] Every form's schema enforces at least what its backend endpoint
      enforces — mismatches found are documented even where not fixed.
- [ ] Inputs disable during submission; form resets on success, not on
      failure.
- [ ] Errors render inline per-field.
- [ ] Legacy LMS checked for any validation rule the current port is
      missing — findings noted even if not all are fixed in this pass.

**Acceptance for B.2 (data pages):**
- [ ] Every listed data-intensive page has a working refresh control.
- [ ] Refresh re-fetches all of that page's data sources, not just one.
- [ ] Loading behavior (coordinated vs. per-section skeleton) is a
      deliberate per-page choice, not left as whatever the framework
      happened to do by default — and it's noted which choice was made
      and why for any non-obvious case.

**Ground rules (same as Plan 016):** commit incrementally, verify
`tsc`/`eslint` clean, browser-verify against real data where the test
account (`delightsheriff@gmail.com`) has it, flag (don't silently skip)
any page you can't verify live for lack of data, update
`plans/pages/*.md` status where relevant. Given the size of §B.2's page
list, multiple commits (grouped sensibly, e.g. one per page or a small
cluster of related pages) are expected and preferred over one giant
commit.
