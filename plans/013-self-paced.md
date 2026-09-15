# PLAN 013 — Self-Paced Learning

**Status:** Confirmed (Ready for implementation)  
**Owner:** SmartHub port  
**Depends on:** 001 Foundation (API client seam, auth stores, utils), 002 App Shell & Route Skeleton, 003 Navigation Chrome, 005 Courses & Learning, 009 Billing & Payments, 011 Teaching / Instructor CRUD, 012 Auth Flows & Real API Swap.

---

## 1. Goal

Port the complete **self-paced learning** domain into the new LMS codebase against the live `smarthub-api`. This delivers:
1. **Student Self-Paced Learning**: Course catalogue/list (`/learn`), course shell outline with module/lesson tree & FAQs (`/learn/[slug]`), robust direct/hosted lesson player with watermarked streaming and auto-token refresh (`/learn/[slug]/lessons/[lessonId]`), offline watermarked MP4 downloads, asynchronous certificate handling, upgrade credits toward cohort tracks, active nudges/reminders, and deep-link redirect handling (`/self-paced/[slug]`).
2. **Instructor Self-Paced Workspace**: Referral links issuance/revocation and sharing (`/teach/self-paced`), attributed sales ledger, and multi-currency revenue-share earnings overview.
3. **Adaptive Shell & Navigation**: Update `configs/nav.ts` with `learn` (student) and `teach/self-paced` (instructor) entries, respecting `useEffectiveMode()` and learner shape.

All UI is re-authored on the shadcn `base-vega` preset (`@base-ui/react` with `render` props, not legacy Radix `asChild`), adhering to the CSS token design system without re-importing legacy maroon/orange tokens.

---

## 2. Scope

### In scope

1. **Canonical Module Structure (`modules/self-paced/`)**:
   - **`config/endpoints.ts`**: All API route constants under `/lms/self-paced/*` and app route constants.
   - **`types/api.types.ts`**: Exact wire shapes verified against `smarthub-api` models & services (`ApiSelfPacedCourseSummary`, `ApiSelfPacedCourseDetail`, `ApiSelfPacedLesson`, `ApiLessonPlayback`, `ApiLessonDownload`, `ApiNudge`, `ApiUpgradeCredits`, `ApiPassState`, `ApiLessonCompletion`, `ApiCourseFaq`).
   - **`types/index.ts`**: Normalized UI domain shapes (`SelfPacedCourse`, `SelfPacedLesson`, `LessonPlayback`, `SelfPacedNudge`, `UpgradeCredit`, `PassState`, `CourseFaq`, `EntitlementDenial`).
   - **`types/instructor.types.ts`**: Instructor referral, attributed order, and revenue-share wire & UI shapes.
   - **`api/normalise.ts`**: Pure normalisation taproot converting backend wire responses to UI view models, URL token resolvers, and sorting helpers.
   - **`api/self-paced.service.ts`**: Typed client methods calling `apiClient` (`listCourses`, `getCourse`, `getPlayback`, `markComplete`, `unmarkComplete`, `requestDownload`, `listNudges`, `dismissNudge`, `getUpgradeCredits`, `getPass`).
   - **`api/self-paced.queries.ts`**: TanStack Query v5 hooks with caching policies, query keys, optimistic lesson completion toggle, and cache invalidation.
   - **`api/instructor.service.ts`**: Instructor API service (`getLinks`, `issueLink`, `revokeLink`, `getOrders`, `getEarnings`).
   - **`api/instructor.queries.ts`**: Instructor query hooks (`useMyInstructorLinks`, `useIssueInstructorLink`, `useRevokeInstructorLink`, `useMyAttributedOrders`, `useMySelfPacedEarnings`).
   - **`lib/`**:
     - `access-denial.ts`: Machine-readable `errorCode` detection (`ENTITLEMENT_*`, 403, 404) and retry policy.
     - `format.ts`: `formatDuration`, `formatMinor` (currency-safe minor unit formatting), `formatBps`.
     - `nudge-link.ts`: Deep-link route normaliser mapping legacy `/self-paced/:slug?lesson=:id` to `/learn/:slug/lessons/:lessonId`.
     - `share-link.ts`: Public marketing referral URL generator using public site origin resolution.
   - **`hooks/`**:
     - `use-certificate-refetch.ts`: Bounded polling for asynchronous certificate generation.
     - `use-learner-shape.ts`: Learner classification (`hasSelfPaced`, `selfPacedOnly`, `teachesSelfPaced`).
     - `use-lesson-download.ts`: Watermarked download polling and blob triggering lifecycle.
   - **`components/`** (re-authored on shadcn `base-vega`):
     - `SelfPacedCoursesPageContent.tsx`, `SelfPacedCoursesSection.tsx`, `SelfPacedCourseCard.tsx`, `ContinueSelfPacedCard.tsx`
     - `SelfPacedCoursePageContent.tsx`, `CourseCover.tsx`, `CourseFaqs.tsx`, `LessonList.tsx`
     - `LessonPlayerPageContent.tsx`, `LessonVideo.tsx`, `LessonDownload.tsx`
     - `CertificateCard.tsx`, `PassMembershipCard.tsx`, `UpgradeCreditBanner.tsx`, `SelfPacedNudges.tsx`, `AccessStates.tsx`
     - `InstructorSelfPacedPageContent.tsx`, `InstructorReferralLinks.tsx`, `InstructorAttributedSales.tsx`, `InstructorSelfPacedEarnings.tsx`

2. **Routes to Wire**:
   - `app/(app)/learn/page.tsx`: Student self-paced catalogue page.
   - `app/(app)/learn/[slug]/page.tsx`: Course detail shell with lessons, FAQs, certificate, and community link.
   - `app/(app)/learn/[slug]/lessons/[lessonId]/page.tsx`: Full lesson player with resilient video stream recovery and completion tracking.
   - `app/(app)/self-paced/[slug]/page.tsx`: Notification deep-link redirector.
   - `app/(app)/teach/self-paced/page.tsx`: Instructor referral and revenue workspace.

3. **Navigation Integration**:
   - Update `configs/nav.ts` with `Self-paced` (`/learn`) in student navigation and `Self-paced sales` (`/teach/self-paced`) in instructor navigation.
   - Support `NavLearnerShape` filtering for self-paced-only accounts.

4. **Shared Infrastructure Additions**:
   - `lib/public-origin.ts`: Centralized public marketing client origin resolver.
   - `components/ui/pager.tsx`: Standardized base-ui pagination controls.

5. **Unit Tests**:
   - `tests/self-paced/normalise.test.ts`: Course summary, course detail, lesson sorting, upgrade credits filtering, playback URL creation.
   - `tests/self-paced/access-denial.test.ts`: `entitlementDenial`, `apiErrorCode`, `shouldRetry`.
   - `tests/self-paced/format-and-links.test.ts`: `formatDuration`, `formatMinor`, `formatBps`, `nudgeHref`, `referralShareUrl`.

6. **Documentation & ADR**:
   - `docs/adr/0016-watermarked-streaming-and-entitlement-seam.md`: Architectural decision regarding tokenized media proxies, resilient playhead resumption, and standalone entitlement gating outside the cohort payment wall.
   - `docs/adr/README.md`: Index ADR 0016.
   - `CONTEXT.md`: Glossary additions for Self-Paced Course, Entitlement, Access Pass, Upgrade Credit, Nudge, Watermarked Download, Attributed Order.
   - `docs/PROGRESS.md`: Record Plan 013 delivery.

---

### Out of scope (explicitly deferred to follow-ups)

- **Plan 014: Access Module** (`modules/access/`): Dedicated revoked course notices across cohort enrollments (`/access-status`).
- **Plan 015: Jobs Module** (`modules/jobs/`): Student job board and opportunity board.
- **Plan 016: Global Search Backend**: Wiring `CommandPalette` to real backend multi-entity search endpoint.

---

## 3. Source Reference

- Legacy Frontend:
  - `~/Documents/smarthub-projects/smarthub/smarthub-core-lms/src/modules/self-paced/` (all files)
  - `~/Documents/smarthub-projects/smarthub/smarthub-core-lms/src/app/(app)/learn/`
  - `~/Documents/smarthub-projects/smarthub/smarthub-core-lms/src/app/(app)/self-paced/`
  - `~/Documents/smarthub-projects/smarthub/smarthub-core-lms/src/app/(app)/teach/self-paced/`
- Backend API Contracts:
  - `~/Documents/smarthub-projects/smarthub/smarthub-api/src/routes/lms-routes/self-paced.lms.routes.ts`
  - `~/Documents/smarthub-projects/smarthub/smarthub-api/src/controllers/self-paced-*.controllers.ts`
  - `~/Documents/smarthub-projects/smarthub/smarthub-api/src/services/self-paced/*.service.ts`
  - `~/Documents/smarthub-projects/smarthub/smarthub-api/src/models/` (`Entitlement.ts`, `AccessPass.ts`, `CatalogOrder.ts`, `LearnerNudge.ts`, `InstructorCourseLink.ts`, `LessonDownload.ts`, `SelfPacedShare.ts`, `lesson.ts`)

---

## 4. Target Files & Structure

```
modules/self-paced/
├── api/
│   ├── self-paced.service.ts
│   ├── self-paced.queries.ts
│   ├── instructor.service.ts
│   ├── instructor.queries.ts
│   └── normalise.ts
├── components/
│   ├── AccessStates.tsx
│   ├── CertificateCard.tsx
│   ├── ContinueSelfPacedCard.tsx
│   ├── CourseCover.tsx
│   ├── CourseFaqs.tsx
│   ├── InstructorAttributedSales.tsx
│   ├── InstructorReferralLinks.tsx
│   ├── InstructorSelfPacedEarnings.tsx
│   ├── InstructorSelfPacedPageContent.tsx
│   ├── LessonDownload.tsx
│   ├── LessonList.tsx
│   ├── LessonPlayerPageContent.tsx
│   ├── LessonVideo.tsx
│   ├── PassMembershipCard.tsx
│   ├── SelfPacedCourseCard.tsx
│   ├── SelfPacedCoursePageContent.tsx
│   ├── SelfPacedCoursesPageContent.tsx
│   ├── SelfPacedCoursesSection.tsx
│   ├── SelfPacedNudges.tsx
│   └── UpgradeCreditBanner.tsx
├── config/
│   └── endpoints.ts
├── hooks/
│   ├── use-certificate-refetch.ts
│   ├── use-learner-shape.ts
│   └── use-lesson-download.ts
├── lib/
│   ├── access-denial.ts
│   ├── format.ts
│   ├── nudge-link.ts
│   └── share-link.ts
└── types/
    ├── api.types.ts
    ├── index.ts
    └── instructor.types.ts

app/(app)/
├── learn/
│   ├── page.tsx
│   └── [slug]/
│       ├── page.tsx
│       └── lessons/
│           └── [lessonId]/
│               └── page.tsx
├── self-paced/
│   └── [slug]/
│       └── page.tsx
└── teach/
    └── self-paced/
        └── page.tsx

lib/
└── public-origin.ts

components/ui/
└── pager.tsx

tests/self-paced/
├── normalise.test.ts
├── access-denial.test.ts
└── format-and-links.test.ts

docs/adr/
└── 0016-watermarked-streaming-and-entitlement-seam.md
```

---

## 5. shadcn Components to Use (via Base-UI `base-vega`)

All primitives are imported from `@/components/ui/*`:
- `button` (using `render={<Link ... />}` or `render={<a ... />}`)
- `card`
- `badge` (styled with standard semantic classes)
- `progress`
- `accordion` (for course FAQs)
- `tabs` (for instructor sub-views)
- `dialog` & `alert-dialog`
- `input`
- `skeleton`

---

## 6. Steps

1. **Shared Primitives & Utilities**:
   - Create `lib/public-origin.ts` for safe SSR-aware client origin resolution.
   - Create `components/ui/pager.tsx` re-authored on Base UI styling.
2. **Module Foundation (Endpoints & Types)**:
   - Create `modules/self-paced/config/endpoints.ts`.
   - Create `modules/self-paced/types/api.types.ts`, `types/index.ts`, `types/instructor.types.ts`.
3. **Pure Logic & Normalisation**:
   - Create `modules/self-paced/lib/access-denial.ts`, `lib/format.ts`, `lib/nudge-link.ts`, `lib/share-link.ts`.
   - Create `modules/self-paced/api/normalise.ts`.
   - Add unit tests in `tests/self-paced/` and verify with Vitest.
4. **Services & Query Hooks**:
   - Create `self-paced.service.ts` and `self-paced.queries.ts`.
   - Create `instructor.service.ts` and `instructor.queries.ts`.
   - Create custom hooks: `use-certificate-refetch.ts`, `use-lesson-download.ts`, `use-learner-shape.ts`.
5. **UI Components**:
   - Re-author supporting components (`AccessStates`, `CourseCover`, `CourseFaqs`, `LessonList`, `CertificateCard`, `PassMembershipCard`, `UpgradeCreditBanner`, `SelfPacedNudges`, `LessonDownload`, `LessonVideo`, `SelfPacedCourseCard`, `ContinueSelfPacedCard`, `SelfPacedCoursesSection`).
   - Re-author major page contents: `SelfPacedCoursesPageContent`, `SelfPacedCoursePageContent`, `LessonPlayerPageContent`, `InstructorReferralLinks`, `InstructorAttributedSales`, `InstructorSelfPacedEarnings`, `InstructorSelfPacedPageContent`.
6. **Routes & App Shell Wiring**:
   - Wire route pages under `app/(app)/learn/*`, `app/(app)/self-paced/*`, `app/(app)/teach/self-paced/*`.
   - Wire `configs/nav.ts` with learner/instructor self-paced navigation entries.
7. **Verification & Documentation**:
   - Run typecheck, lint, Vitest tests, and production build.
   - Author ADR 0015 and update `docs/adr/README.md`.
   - Update `CONTEXT.md` and `docs/PROGRESS.md`.

---

## 6.5 Architecture Brief (see `ARCHITECTURE.md`)

1. **Deepen**:
   - *Video playback & streaming token lifecycle*: Stream tokens lapse in ~10 minutes. `LessonVideo` internally manages proactive pre-expiry refreshes, failure backoff, and playhead position restoration seamlessly without reloading the page or exposing tokens to consumers.
   - *Entitlement vs Cohort Payment Gate*: Self-paced learners pay 100% upfront via Paystack and are entitled via `Entitlement` or `PassMembership`. They must never be blocked by the cohort `PaymentGate` (which inspects installment plans).
2. **Seams**:
   - *Watermarked Media Proxy Seam*: Neither raw video CDN URLs nor Cloudinary asset keys are exposed to the client. The media proxy validates tokens and entitlements, and proxies video byte streams with Range headers or attachment redirects.
   - *Public Marketing Funnel Seam*: Referral tracking and cohort track upsells cross from LMS into the public marketing site with deterministic `?ref=` query parameters.
3. **Testability**:
   - Pure normalisers, link builders, duration/currency formatters, and entitlement refusal decoders are tested independently of HTTP mocks or browser DOM.
4. **ADR**:
   - ADR 0016: Watermarked Content Delivery & Entitlement Seam.

---

## 7. Acceptance Checks

- [ ] `npm run typecheck` passes with 0 errors.
- [ ] `npm run lint` passes with 0 errors.
- [ ] `npm test` passes with all new unit tests.
- [ ] `npm run build` succeeds cleanly.
- [ ] `/learn`, `/learn/[slug]`, `/learn/[slug]/lessons/[lessonId]`, `/self-paced/[slug]`, and `/teach/self-paced` render properly.
- [ ] All UI primitives use shadcn `base-vega` with `render` props without Radix `asChild`.
- [ ] Navigation dynamically shows `/learn` and `/teach/self-paced` based on mode and learner role.

---

## 8. Open Questions / Assumptions

1. **Access Status Dependency**: In the legacy codebase, `useLearnerShape` queried `/lms/me/access-status` from the deferred `access` module to detect active cohort enrollment. In this port, until Plan 014 arrives, `useLearnerShape` gracefully treats active cohort enrollment as false if access status is unavailable, avoiding any blocking dependencies.
2. **API Environment**: The Axios client in `lib/api/client.ts` uses `NEXT_PUBLIC_API_BASE_URL` (defaulting to `http://localhost:5050/api/v1`). Integration with live staging or local `smarthub-api` functions seamlessly over this seam.
