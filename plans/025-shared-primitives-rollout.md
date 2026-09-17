# PLAN 025 — Shared primitives rollout (utils, StatusBadge, pluralize)

No single route — this is a cross-cutting adoption pass, not a page
redesign. Read `plans/000-index.md` first (ground rules, shared).

## Current state (read in full)

Four shared pieces landed this session, each already used at a few
real call sites as proof + immediate value, with the bulk of the
rollout still open:

1. **`lib/utils/`** (was `lib/utils.ts`, split by domain — `cn.ts`,
   `format-date.ts`, `format-text.ts`, `html.ts`, `status.ts`, barrelled
   through `index.ts`). `@/lib/utils` still resolves the same way; no
   import changes needed anywhere.
2. **`pluralize(count, singular, plural?, withCount?)`** in
   `lib/utils/format-text.ts` — replaces `n === 1 ? "x" : "xs"`
   ternaries. `withCount: false` returns just the word for callers
   composing the number themselves (e.g. inside a `<strong>`).
3. **`getInitial(name)`** in `lib/utils/format-text.ts` — single-letter
   avatar initial. Already fully rolled out (2/2 real sites: profile
   page, user-menu) — nothing left to do here.
4. **`StatusBadge`** (`components/ui/status-badge.tsx`) — resolves a
   status string to a `Badge` variant + label via the registry in
   `lib/utils/status.ts` (`STATUS_REGISTRY`). One real site converted
   so far (`CohortSubmissionsTab`'s "Late" pill).

## Direction

### pluralize — mechanical, low-risk

25 files still have at least one `n === 1 ? "x" : "xs"` (or `? "" :
"s"`) ternary — re-run `grep -rln '=== 1 ? "' --include="*.tsx" modules
app` to get the current list (some in the list below may have more
than one occurrence per file):

`app/(app)/dashboard/page.tsx`, `modules/acceptance-letters/components/EditSiwesDurationDialog.tsx`,
`modules/assigned-modules/components/{AssignedModulesPageContent,DashboardAssignedModulesWidget}.tsx`,
`modules/assignments/components/assignment-list-page-content.tsx`,
`modules/billing/components/BillingPageContent.tsx`,
`modules/calendar/components/DashboardCalendarCard.tsx`,
`modules/conversations/components/InboxPageContent.tsx`,
`modules/courses/components/{CoursesPageContent,course-module-row}.tsx`,
`modules/help/components/HelpPageContent.tsx`,
`modules/jobs/components/JobsPageContent.tsx`,
`modules/learning/components/materials-page-content.tsx`,
`modules/notifications/components/NotificationsPageContent.tsx`,
`modules/payment-proofs/components/PaymentsPageContent.tsx`,
`modules/referrals/components/ReferralsPanel.tsx`,
`modules/self-paced/components/{InstructorAttributedSales,InstructorReferralLinks,InstructorSelfPacedEarnings,LessonDownload,PassMembershipCard}.tsx`,
`modules/teaching/components/{ClassSessionAttendancePage,CohortAssignmentsTab,CohortRosterTab,CourseCard,TeachPageContent}.tsx`.

For each: replace the ternary with `pluralize(count, singular)`. If the
count is wrapped in its own element (commonly `<strong>{n}</strong>
word{s}`), use `pluralize(count, singular, undefined, false)` for the
word only and leave the `<strong>` count as-is — see
`modules/calendar/components/CalendarPageContent.tsx` (already
converted) for the exact pattern. Don't force it where the "word" is a
whole templated string that doesn't cleanly separate from the count.

**Do not touch** `modules/jobs/components/JobsPageContent.tsx`'s
`postedLabel()` — it's a day-only "Today / Yesterday / N days ago"
label, deliberately different granularity from `timeAgo()`
(minutes/hours), not a duplicate of it.

### StatusBadge — needs judgment per site, not mechanical

`grep -rn '<Badge variant=' --include="*.tsx" modules app` (67 hits)
and `grep -rln 'bg-success/10\|bg-warning/10\|bg-destructive/10'
--include="*.tsx" modules app` (33 files) are both far bigger than
what's worth converting file-by-file in one pass. Two different
patterns hide in those greps — tell them apart before touching
anything:

1. **A real status pill** (`<Badge variant="destructive">Overdue</Badge>`,
   a job's Remote/Onsite badge, a payment's Paid/Pending/Failed badge)
   — convert to `<StatusBadge status="overdue" />` etc. This is the
   actual target.
2. **An icon-chip tint** (`iconClassName="bg-success/10 text-success"`
   passed to `LedgerItem`/`NagItem`/`LedgerControlItem`) — **leave
   these alone**. That's a different, already-correct pattern (a tinted
   icon container, not a text pill) and doesn't belong on `StatusBadge`.

Add any status the registry doesn't cover yet to
`STATUS_REGISTRY` in `lib/utils/status.ts` rather than inventing a
one-off `variant`/className pairing at the call site — that registry
is the whole point (one place decides what "shipped" or "waitlisted"
looks like, not each page separately).

Good starting files (real status pills, not icon chips):
`modules/jobs/components/JobsPageContent.tsx` (Remote/Onsite),
`modules/payment-proofs/components/{PaymentStatusBanner,InstallmentScheduleCard}.tsx`,
`modules/internships/components/InternshipWorkspacePageContent.tsx`,
`modules/billing/components/RegistrationBillingCard.tsx`,
`modules/self-paced/components/CertificateCard.tsx`.

## Acceptance

(Plus the shared checklist in `plans/000-index.md`.)

- [ ] Every converted `pluralize()` call renders identically to what
      it replaced — spot check a few with real counts (1, 0, and >1).
- [ ] `StatusBadge` conversions only touch real status-pill call sites,
      never an icon-chip `iconClassName`.
- [ ] Any new status added to `STATUS_REGISTRY` has a sensible
      `tone` (success/warning/destructive/neutral) — don't add a
      status that's really the same concept under a different string
      (e.g. "canceled" vs "cancelled") without normalizing to one key.
- [ ] `npm run typecheck` and `npm run lint` still pass after each
      batch of edits, not just at the very end.
