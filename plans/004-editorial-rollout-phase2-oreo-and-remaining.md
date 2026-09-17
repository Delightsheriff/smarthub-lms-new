# PLAN 004 — Editorial Modernization: Oreo AI & Final Unmigrated Surfaces

**Status:** Proposed (Awaiting User Review)
**Owner:** SmartHub Design System ("The Brief" rollout phase 2)
**Depends on:** `plans/DESIGN-SYSTEM.md`, `plans/002-editorial-rollout-handoff.md`, `plans/003-editorial-rollout-phase1.md`

---

## 1. Executive Summary & Analysis

Following the successful rollout across the 15 core learning and account surfaces in Plan 003, this plan addresses **Oreo AI Assistant** and audits every remaining page across the application to bring them into 100% compliance with "The Brief" editorial design language, mobile/tablet responsive integrity, and SmartHub brand tokens (`#430330` primary maroon / `#F29913` accent orange).

### Analysis of Unmigrated Surfaces:

| Page / Route | Component Path | Current State & Gaps | Target Design Move |
|---|---|---|---|
| **Oreo AI Assistant** (`/oreo`) | `modules/oreo/components/OreoPageContent.tsx` | Old `eyebrow="AI Assistant"` PageHeader; basic token usage pill; plain suggestion chips; rigid chat card. | Masthead with live usage quota/token meters, elevated suggestion prompts, polished message bubbles with brand styling, smooth auto-scroll. |
| **Help Library** (`/help`) | `modules/help/components/HelpPageContent.tsx` | Old `eyebrow="Support"` PageHeader; lacks dateline/divider/guide counts. | Editorial masthead (`dateline`, `divider`, guide totals), category sections with responsive cards. |
| **Notifications Center** (`/notifications`) | `modules/notifications/components/NotificationsPageContent.tsx` | Old `eyebrow="Notifications"` PageHeader; inline Mark All Read button risks mobile wrapping. | Editorial masthead, flex-wrapped actions with unread indicator badge, clean card transitions. |
| **Assigned Modules** (`/assigned`) | `modules/assigned-modules/components/AssignedModulesPageContent.tsx` | Old `eyebrow="Learning"` PageHeader; lacks dateline/divider/module counts. | Editorial masthead with active standalone modules count, polished accordion trigger rhythm. |
| **Self-Paced Courses** (`/learn`) | `modules/self-paced/components/SelfPacedCoursesPageContent.tsx` | Old `eyebrow="Learning"` PageHeader; basic layout. | Editorial masthead with course inventory counts, responsive lesson cards. |
| **Instructor Self-Paced** (`/teach/self-paced`) | `modules/self-paced/components/InstructorSelfPacedPageContent.tsx` | Old `eyebrow="Teaching"` PageHeader; unconstrained tabs list. | Editorial masthead, horizontally scrollable tabs bar (`w-max`), earnings summary. |
| **Instructor Earnings** (`/billing` in instructor mode) | `modules/instructor-earnings/components/InstructorEarningsPageContent.tsx` | Old `eyebrow="Teaching"` PageHeader; lacks dateline/divider; basic cards. | Editorial masthead with live total accrued/paid metrics, bento stat tiles, revenue ledger. |
| **Cohort Revenue Breakdown** (`/billing/cohort/[scheduleId]`) | `modules/instructor-earnings/components/CohortEarningsDetailContent.tsx` | Lacks editorial masthead; raw cards for collections. | Editorial masthead with cohort revenue share stats and student collections table. |
| **Internship Fee Payment** (`/internships/me/payment`) | `modules/internships/components/payment/InternshipPaymentPageContent.tsx` | Old `eyebrow="Internship"` PageHeader without dateline/divider. | Editorial masthead with payment status badge, receipt card styling. |
| **Session Attendance** (`/teaching/sessions/[id]`) | `modules/teaching/components/ClassSessionAttendancePage.tsx` | Heavy header and rigid save bar. | Editorial masthead with session datetime, quick attendance status selectors, responsive table. |
| **Assignment Detail** (`/assignments/[id]`) | `modules/assignments/components/assignment-page-content.tsx` | Boxed header card below back button; countdown wraps awkwardly on narrow screens. | Editorial banner with breadcrumb, responsive deadline countdown badge, and clean instructions formatting. |
| **Course Module Detail** (`/courses/[slug]/modules/[moduleSlug]`) | `modules/courses/components/CourseModulePageContent.tsx` | Boxed card header; separate accordion. | Cohesive module header, tabs with horizontal scroll protection (`w-max`), and clean lesson objectives. |

---

## 2. Proposed Architecture & Design Moves

### A. Oreo AI Assistant (`/oreo`)
- **Masthead**: `PageHeader` with `variant="editorial"`, `divider`, and `dateline={`${dateline} · AI Knowledge Assistant`}`.
- **Usage & Quota Meter**: Redesigned as an editorial pill with subtle spark icon, bold remaining queries/tokens, and clear refresh status.
- **Empty State & Suggestion Prompts**: Redesigned prompt suggestion chips with subtle accent borders, hover transitions, and category tags.
- **Chat Bubbles & Thinking State**: Refined typography for assistant markdown answers; collapsible "How I got this" tool inspection with clean hairline styling.

### B. Remaining Learning & Support Pages
- **Masthead**: Add `dateline`, `divider`, and informative descriptions with dynamic counts.
- **Tablet & Mobile Safeguards**:
  - Convert all grids to `sm:grid-cols-2 xl:grid-cols-3` or `sm:grid-cols-2 lg:grid-cols-3` to prevent the ~230px column squeeze on tablet with sidebar.
  - Wrap multi-tab lists in `overflow-x-auto pb-1 max-w-full -mx-1 px-1` with `w-max` on `TabsList`.
- **Token Compliance**: Strict SmartHub Maroon `#430330` (primary) and Orange `#F29913` (accent) with solid active states.

---

## 3. Verification & Commit Discipline
- Independent verification before completion: `npm run typecheck && npm run lint`.
- Small, isolated commits per module using exact paths (`git add <paths> && git commit -m ...`).
