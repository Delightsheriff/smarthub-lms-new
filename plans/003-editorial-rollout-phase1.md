# PLAN 003 — Editorial Rollout Phase 1 & 2: Core LMS Surfaces

**Status:** Completed
**Depends on:** `plans/DESIGN-SYSTEM.md`, `plans/002-editorial-rollout-handoff.md`, Plan 001 (reference implementations)

---

## 1. Scope & Shipped Surfaces

Roll out "The Brief" editorial design language and responsive tablet/mobile integrity across all 15 core surfaces:
1. **Assignments (`/assignments`)**: HTML tag stripping (`htmlToPlainText`), `xl:grid-cols-3` grid layout preventing tablet squeeze, responsive tabs with horizontal scroll, and wrapped countdown footer (`880f3b9`).
2. **Materials (`/materials`)**: Editorial masthead, course-grouped `IndexList` with file metadata and download actions (`0f9f208`).
3. **Recordings (`/recordings`)**: Editorial masthead, next-up hero with direct play trigger, and course-grouped index list (`ca1ba32`).
4. **Courses (`/courses` & detail)**: Editorial masthead, enrolled course index list, and polished course detail stats responsive layout (`d33a260`, `e596525`).
5. **Billing (`/billing`)**: Editorial masthead with live total due/paid dynamic metrics (`f663cfb`).
6. **Jobs (`/jobs`)**: Editorial masthead, responsive filter bar with horizontal scroll, and polished company rows (`8e62e24`).
7. **Payments & Proofs (`/payments`)**: Editorial masthead, elevated bank credentials, and styled responsive form (`fd44406`).
8. **Referrals (`/referrals`)**: Editorial masthead with live commission metrics and horizontal tab scroll (`60b8337`).
9. **Internships (`/internships`)**: Editorial masthead, responsive summary cards grid, and polished task rows (`ccc0aa7`).
10. **Activity Log (`/activity`)**: Editorial masthead and formatted event totals (`a3c805c`).
11. **Webinars & Workshops (`/webinars`)**: Editorial masthead, responsive grid, and polished footer padding (`15dac30`).
12. **Calendar (`/calendar`)**: Editorial masthead and consistent spacing (`8ea4979`).
13. **Inbox & Messages (`/inbox`)**: Editorial masthead and horizontally scrollable filter tabs (`f5c5849`).
14. **Profile & Settings (`/profile`)**: Editorial masthead and account creation metadata (`afbe161`).
15. **Cohort Workspace (`/teach/cohorts/[scheduleId]`)**: Editorial masthead and horizontally scrollable 6-tab navigation (`b559f83`).

---

## 2. Design Composition Moves

- **Masthead:** Add `dateline`, `divider`, and informative editorial `description` with numeric metrics highlighted in `<strong className="text-foreground">`.
- **Asymmetric Hero + Ledger:**
  - Assignments: Most urgent pending/overdue coursework takes the dominant hero slot with due countdown, point badge, and submit CTA; paired with an "Upcoming deadlines" `Ledger`.
  - Recordings: Latest unwatched class recording hero with direct video play trigger; paired with course-grouped archive.
- **IndexList / IndexRow:**
  - Materials: Course-grouped `IndexList` with file type icons, size metadata, and direct download/preview actions instead of equal-weight card grids.
  - Recordings: Course-grouped session archive with watched status indicators.
  - Courses: Browse list of enrolled and available tracks with progress rules and duration metadata.

---

## 3. Bug Avoidance & Non-negotiables
- Tailwind responsive prefixes (`hidden sm:flex`) instead of hand-written media query cascade hazards.
- 375px mobile flex verification to guarantee zero child element overflow.
- Strict token usage: SmartHub Maroon `#430330` (primary) and Orange `#F29913` (accent), solid fills on active states, Select for filters.
- Incremental commits using exact file paths (`git commit -- <paths>`).
