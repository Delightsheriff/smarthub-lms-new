# 0013. Instructor Teaching Aggregates and Attendance Seam

Date: 2026-09-01
Status: Accepted

## Context

The instructor Teaching surface (`/teach`, `/teach/cohorts/[scheduleId]`, `/teaching/sessions/[id]`) is the largest domain surface in the SmartHub LMS port. It spans cohort grouping, per-cohort 6-tab workspace shells, submission grading/previewing, assignment schedule mutations, and live session attendance marking.

We needed clear architectural rules for:
1. Attendance service lifecycle vs cohort aggregate reads.
2. Shared grading submission adapter between Inbox, Submissions tab, and Tasks list.
3. Computation of rollup counts (submission/graded/pending/late counts).

## Decision

1. **Independent Attendance Seam**: Attendance (`attendanceService`, `attendanceQueries`) operates as its own service and query key namespace separate from cohort details. `useSessionAttendance` live-polls every 30 seconds independently of cohort aggregate refetches.
2. **Shared Submission & Grading Adapter**: `GradingDialog` operates on `CohortSubmissionRow` / `InboxRow` objects with a unified preview (supporting file, URL, and text submissions inline) and score/feedback mutation interface.
3. **Server/Mock-side Rollup Counts**: Submission, graded, pending, and late counts are computed server/mock-side and passed via normalized wire objects rather than being calculated imperatively inside UI render loops.
4. **Pure Course Grouping**: `isCohortEnded` and `groupCohortsByCourse` are isolated as pure, testable helper functions in `modules/teaching/lib/group-cohorts.ts` with a strict fallback rule: missing or unparseable end dates represent active running cohorts.

## Consequences

- Attendance live polling does not trigger unnecessary refetches of the heavy cohort detail or module tree.
- The grading flow remains latency-free and reusable across the Inbox, Cohort Submissions tab, and instructor Tasks views.
- Components remain thin, declarative, and focused solely on rendering.
