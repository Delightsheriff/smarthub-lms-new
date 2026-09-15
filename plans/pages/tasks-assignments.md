# Tasks / Assignments (`/assignments`, student + instructor)

Status: ✅ Done

## Current state

- List: `app/(app)/assignments/page.tsx` → `assignment-list-page-content.tsx`
  (129) → `assignment-list-card.tsx` (120).
- Detail: `app/(app)/assignments/[id]/page.tsx` → `assignment-page-content.tsx`
  (246) → `grade-card.tsx` (104), `submission-status-card.tsx` (137),
  `submission-history.tsx` (61), `countdown-to-deadline.tsx` (96),
  `submission-form.tsx` (278).
- `app/(app)/courses/[slug]/modules/[moduleSlug]/assignments/[assignmentId]/page.tsx`
  is a re-export shim to the *same* detail component as `/assignments/[id]` —
  current collapsed two legacy routes into one.

## Legacy state

- List: `src/app/(app)/assignments/page.tsx` (217, inline) — branches on
  `useEffectiveMode()` inside the same file: instructor gets
  `NeedsGradingStrip` + `InstructorAssignmentsList`; student gets a flat
  divide-y list.
- Detail (course/module-scoped): `.../modules/[moduleSlug]/assignments/[assignmentId]/page.tsx`
  (289 lines) — materially more feature-complete than current's shared
  detail page.

## Concrete gaps

1. **No due-date sort.** Legacy sorts every filter view newest-due-first,
   with a code comment noting a past bug where sort only applied to the
   "all" tab (legacy `page.tsx:117-125`). Current's `filtered` array
   (`assignment-list-page-content.tsx:16-33`) has no `.sort()` at all —
   order is whatever the API returns.
2. **Search exists in current, not legacy** (net addition, keep it).
3. **Status filter re-labeled, functionally close.** Legacy: All/Open/
   Submitted/Reviewed. Current: All/Pending/Submitted/Graded/Overdue (5
   states vs 4) — not a regression, just confirm "Reviewed" vs "Graded"
   labeling intent didn't get lost (legacy relabels "graded" → "Reviewed"
   specifically because points are hidden from students — see #6).
4. **Deep-link filter param dropped.** Legacy reads `?filter=open|submitted|
   graded|all` (`page.tsx:88-95`), used by dashboard stat-tile deep links.
   Current has no `useSearchParams` at all in this file — those deep links
   are currently dead/no-op.
5. **Instructor/student split moved.** Legacy handles both in one route.
   Current's `/assignments` renders the student view unconditionally — no
   `useEffectiveMode()` guard. **Confirm**: does an instructor hitting
   `/assignments` today see a broken/empty student-shaped view, or does nav
   route them elsewhere (`/teach/assignments`)? Check before assuming this
   is reachable — nav config sends instructor mode's "Tasks" item to the
   same `/assignments` href (`configs/nav.ts` `INSTRUCTOR_MODE_ITEMS`), so
   this is very likely a real, reachable bug.
6. **Grading points/scores shown to students — likely regression, needs a
   product call before "fixing."** Legacy's `grade-card.tsx` has the entire
   score/percentage/letter-grade/rubric block commented out, with an
   explicit in-code note: *"Grading points hidden by request... feedback
   (text+audio+video) still renders below"* (legacy `grade-card.tsx:4-7,
   26-31,91`); legacy also hides "Total points" on the assignment hero
   (course/module detail page:153-156, "hidden by request"). Current's
   `grade-card.tsx` fully renders scores/points/percentage/letter-grade/
   rubric (lines 37-100), and current's list card + detail page both show
   point totals prominently. This reads as the port having pulled from a
   codebase revision *before* that "hide points" decision shipped in
   legacy — or as a deliberate later reversal we don't have visibility
   into from the frontend alone. **Do not silently flip this either way
   without flagging it explicitly in the commit message and to the user**
   — implement the hide (matching legacy, the more conservative default
   for now) but call it out clearly as a reversible decision.
7. **Audio/video instructor feedback dropped.** Legacy's `grade-card.tsx:
   102-132` renders `<audio>`/`<video>` for `feedback.audioFeedbackUrl` /
   `videoFeedbackUrl`. Current has no equivalent — text feedback only.
   Verify the backend still returns those fields before porting UI for
   them.
8. **Per-assignment messaging thread dropped.** Legacy's course/module
   detail page renders `<AssignmentThread assignmentId courseId moduleId>`
   (legacy detail page:252-256). Current has no equivalent import.
   `modules/messaging/components/AssignmentThread.tsx` already exists in
   current (confirmed via the Inbox audit) — this may just need wiring in,
   not building from scratch.
9. **Submission-window-closed handling dropped.** Legacy computes
   `submissionWindowClosed = pastDue && !assignment.allowLateSubmission`
   and renders a locked-state card that suppresses the form entirely
   (legacy detail page:84,211-220). Current shows a generic "past deadline"
   alert but **still renders the submission form regardless of
   `allowLateSubmission`** — a student can submit into a guaranteed-
   rejected POST. This is a real, fixable bug, independent of the points
   question.
10. Raw Tailwind colors — the largest concentration found in this audit (14
    hits): `assignment-list-card.tsx:29,35,58`; `submission-status-card.tsx:
    31,37,50`; `grade-card.tsx:21,24-25,52,57,87`; `countdown-to-deadline.tsx:88`;
    `assignment-page-content.tsx:114,141`.
11. No `PageHeader`/`EmptyState` adoption anywhere in this module.

## Design direction

This surface needs real fixes, not just a re-skin: the late-submission bug
(#9) and the instructor-route bug (#5) are functional correctness issues,
independent of styling. Fix those first. Then: theme tokens, PageHeader/
EmptyState, due-date sort, deep-link filter param. The points-visibility
question (#6) — implement legacy's hide-by-default behavior since that was
an explicit, documented decision, but flag it prominently for review.

## Acceptance criteria

- [ ] Confirmed (via testing, not assumption) whether instructor mode
      hitting `/assignments` sees a broken view; if so, add the
      `useEffectiveMode()` branch or a redirect to the correct instructor
      surface.
- [ ] Submission form does not render (shows a locked-state message
      instead) when `pastDue && !assignment.allowLateSubmission`.
- [ ] List sorts by due date (soonest/most-recently-due first) on every
      filter tab, not just implicitly via API order.
- [ ] `?filter=` query param pre-selects the status tab on load.
- [ ] Score/points/rubric hidden from the student-facing grade card and
      assignment hero, matching legacy's documented decision — flagged
      clearly in the commit message as a reversible call, not silently
      done.
- [ ] `AssignmentThread` wired into the assignment detail page if the
      backend still supports it (verify the endpoint exists before wiring).
- [ ] All 14+ raw Tailwind color instances replaced with theme tokens.
- [ ] `PageHeader`/`EmptyState` adopted in the list page.
- [ ] `npx tsc --noEmit` and `npx eslint` clean on every touched file.
- [ ] Verified in the browser: late-submission lock, sort order, and (if
      reachable) instructor-mode `/assignments` behavior.
