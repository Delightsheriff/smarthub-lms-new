# PLAN 003 — Editorial Rollout Phase 1: Core Academic & Learning Surfaces

**Status:** In Progress
**Depends on:** `plans/DESIGN-SYSTEM.md`, `plans/002-editorial-rollout-handoff.md`, Plan 001 (reference implementations)

---

## 1. Scope

Roll out "The Brief" editorial design language across the core learning surfaces:
1. **`modules/assignments/components/assignment-list-page-content.tsx`** (Assignments: student & instructor)
2. **`modules/learning/components/materials-page-content.tsx`** (Materials repository)
3. **`modules/learning/components/recordings-page-content.tsx`** (Class recordings archive)
4. **`modules/courses/components/CoursesPageContent.tsx`** (Courses catalog & enrolled views)

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
