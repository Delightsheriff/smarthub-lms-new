# Page-by-page legacy-parity & redesign audit

Master index. One doc per sidebar nav destination (all roles), each with:
legacy behavior, current gaps, design direction, and acceptance criteria —
written *before* implementing, so implementation has a concrete spec to
check against instead of re-deriving intent from scratch each time.

Legacy root: `~/Documents/smarthub-projects/smarthub/smarthub-core-lms`
Current root: this repo.

Work order follows render order from Home outward (per explicit instruction),
not alphabetical. Update the Status column as each doc's acceptance criteria
are met and committed.

| # | Doc | Nav item(s) | Status |
|---|---|---|---|
| 1 | [home-dashboard.md](home-dashboard.md) | Home (student + instructor) | ✅ Done |
| 2 | [ask-oreo.md](ask-oreo.md) | Ask Oreo | ✅ Redesigned earlier this session (chat primitives) |
| 3 | [courses.md](courses.md) | Courses (cohort + self-paced, student + instructor) | 🟡 Critical instructor-routing bug fixed + first creative pass done; self-paced + deeper redesign still open |
| 4 | [recordings.md](recordings.md) | Recordings | ✅ Done |
| 5 | [materials.md](materials.md) | Materials | ✅ Done |
| 6 | [tasks-assignments.md](tasks-assignments.md) | Tasks / Assignments (student + instructor) | ✅ Done |
| 7 | [assigned-to-you.md](assigned-to-you.md) | Assigned to you | ✅ Redesigned earlier this session |
| 8 | [billing-earnings.md](billing-earnings.md) | Billing (student) / Earnings (instructor) / Payments | ✅ Redesigned earlier this session |
| 9 | [internship.md](internship.md) | Internship | ✅ Redesigned earlier this session |
| 10 | [calendar.md](calendar.md) | Calendar | 🔴 Not started |
| 11 | [inbox.md](inbox.md) | Inbox | ✅ Done |
| 12 | [activity.md](activity.md) | Activity | 🔴 Not started |
| 13 | [refer-and-earn.md](refer-and-earn.md) | Refer & earn | ✅ Redesigned earlier this session |
| 14 | [profile.md](profile.md) | Profile | ✅ Redesigned earlier this session |
| 15 | [webinars.md](webinars.md) | Webinars | 🔴 Not started |
| 16 | [help.md](help.md) | Help | ✅ Done |
| 17 | [self-paced-sales.md](self-paced-sales.md) | Self-paced sales (instructor) | 🔴 Not started |

## Cross-cutting fixes (not page-specific)

- ✅ `UserMenu` (account dropdown) had "Profile", "Settings", "Help & support"
  all routing to `/profile` — same bug present in legacy. Fixed: Settings
  removed (redundant with Profile since the Profile/Settings merge),
  Help & support now goes to `/help`. Commit `9938214`.
- ✅ Profile's Student ID row was conditionally hidden when unset, reading
  as "no such field" rather than "not assigned yet" for anyone comparing
  against a production account that has one. Now always visible with a
  fallback. Commit `aac86bb`.
- ✅ **Grading points visibility** — legacy explicitly hides scores/points/
  rubric from students ("hidden by request", see its own in-code comment).
  Current showed them — implemented legacy's hide, matching feedback-only
  display. **This is a reversible product decision, not a bug fix in the
  usual sense — confirm with product that hiding points is still the
  intended behavior before treating this as settled.** See
  tasks-assignments.md.
- ✅ **Instructor `/assignments` showed the student view** — same bug class
  as the `/courses` one below; instructors had no way to see their
  cohorts' assignments or the needs-grading inbox from the main nav.
  Fixed alongside the rest of the Tasks/Assignments pass.

## Process for each doc

1. Read the full current implementation and the full legacy implementation.
2. Note every concrete behavioral difference (name the feature, not "looks
   different") — dead links, missing filters, raw Tailwind colors, hand-rolled
   markup where a shared primitive exists, dropped features.
3. Write acceptance criteria as a checklist — specific, testable, no
   ambiguity about what "done" means.
4. Implement, verify (typecheck + lint + browser), commit.
5. Flip the status in this table and in the doc's own header.
