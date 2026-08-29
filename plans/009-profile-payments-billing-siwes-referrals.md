# PLAN 009 — Profile, Payments & Billing, SIWES, Acceptance Letters, Referrals

**Status:** Draft (awaiting confirmation)
**Owner:** SmartHub port
**Depends on:** 001 Foundation (mock database, mirrored wire types + enums, API-client seam, stores/utils), 002 app-shell & route stubs, 003 navigation chrome. 004 dashboard composes the same billing/referrals widget surfaces this slice ships but is *not* a blocker. 005 ships `use-previewable-url` + `cloudinary-download` that the acceptance-letter download/view reuses. Real auth stays Plan 012 (only the **types** land here); internships payment stays Plan 010.

---

## 1. Goal

Port the **student account & finance cluster** end-to-end against the mock, in eight modules: **profile** (identity card, self-edit details, security, banking, professional, attendance PIN, photo gate), **payment-proofs** (bank-transfer surface, installment-schedule cards, the two shell gates), **billing** (breakdown with discount presence + installments + waiver semantics), **instructor-earnings** (the instructor side of `/billing`), **siwes-profile**, **acceptance-letters**, **referrals** (refer-and-earn: code pill, share/earnings/ledger/payouts), plus the self-contained **check-in** page. All reads cross the Foundation API seam from `mockDatabase.ts`; all UI is rebuilt on the `base-vega` preset.

This slice also **crystallizes two architectures-critical seams** (`ARCHITECTURE.md` §"Known seams"): the **payment seam** (waiver/installment/full/manual behind one surface; the paywall + banner + schedule card all read the same installment-plan shape) and the **storage/upload seam** (avatar, payment-proof receipt, and acceptance-letter downloads through one upload→URL→preview/download path). Both get ADRs here.

## 2. Scope

### In scope

- **Auth types** (`modules/auth/types/index.ts`) — the full `AuthUser` projection and the invitation/password wire shapes. *Types only* — login/reset/invitation **flows** defer to Plan 012. `LoginRequest`/`LoginResponse` are defined now for the sealed contract.
- **Profile module** (`modules/profile/`) — identity card + `EditProfileDetailsDialog` (name/gender free, phone behind unlock), `AvatarUploader` (pick → preview → downscale → `/uploads` → PATCH), `AttendancePinSection` (rotate-once PIN), `BankingTab` (profile banking sub-doc editor), `ProfessionalTab` (instructors + dual-role), `ProfilePhotoGate` (student shell gate), profile self-edit queries that fold patches into the cached `AuthUser`.
- **Billing module** (`modules/billing/`) — `normaliseBreakdown` (the **discount-presence toggle**), `BillingSummaryCard` (+ `totalDiscount` "you saved" line), `RegistrationBillingCard` (per-registration: status badge, discount pill + struck-through list price, progress, installment label, payment history), `BillingPageContent`, `DashboardBillingWidget` (reads `useBillingBreakdown().data.overall.totalDue`; self-gates when ≤ 0). `useBillingSummary` kept only for the legacy endpoint contract (see §8).
- **Payment-proofs module** (`modules/payment-proofs/`) — `PaymentsPageContent` (transfer-to bank block, per-tranche schedule cards, one prefill-on-"Pay this" proof form, submissions history w/ review notes, proof `status` tones), `InstallmentScheduleCard` (every tranche, progress bar, overdue/waived/paid tones, grace "access pauses on"), `PaymentGate` (full-page paywall for `suspended_payment`), `PaymentStatusBanner` (grace-window amber nudge). Wire shapes move from the source's service file into a proper `types/` folder (deepening, see §6.5).
- **SIWES module** (`modules/siwes-profile/`) — read-only `SiwesPlacementTab` rows (length-edit pencil when `siwesDurationEditable`; "Locked — contact admin" otherwise). Passthrough normaliser.
- **Acceptance-letters module** (`modules/acceptance-letters/`) — `normaliseAcceptanceLetter` (**`issuedAt: string → Date`**), ref-number **dedupe** at query time (one card per applicant-level letter), `AcceptanceLetterCard` (dashboard tile, view/download via `cloudinary-download`), `EditSiwesDurationDialog` (1–12 months; PATCH invalidates both letter + SIWES lists).
- **Instructor-earnings module** (`modules/instructor-earnings/`) — read-only: totals tiles (pending/processing/paid), `byKind` split (base/variable/bonus), per-cohort table → `/billing/cohort/[scheduleId]` detail, payout history table, bank-details nudge. **Verbatim API envelope — no normaliser** (see §6.5.1).
- **Referrals module** (`modules/referrals/`) — `ReferralsPanel` (code-pill header; Share / Earnings / Ledger / Payouts tabs), `ProgramShareLink` (three programs, env/subdomain-resolved public origin), `CopyableCode`, `DashboardReferralsWidget` (self-gates without a code), banking + payout queries (`/account/banking`, referrals payouts CRUD), `AccountMe`/`ReferralsResponse`/`Payouts*`. **Verbatim envelopes — no normaliser** (see §6.5.1).
- **Route pages** (thin, delegating to `*PageContent`): `/profile` (tab strip incl. `?tab=` deep-links, with **Security as a tab**, not a separate page — the legacy routed password change out to `/profile/security`, which left the tab strip with a dead trigger; we render it in-place), `/billing` (mode branch → student billing **or** instructor earnings), `/billing/cohort/[scheduleId]` (instructor cohort detail), `/payments`, `/refer-and-earn`, `/check-in`. Plus the shell mounts: `PaymentGate`, `PaymentStatusBanner`, `ProfilePhotoGate` inside the `(app)` layout (below the auth gate).
- **Mock seed + handlers** — the finance/account fixtures and endpoints listed in §2.2 (extends Foundation; does not re-architect the seam).
- **Unit tests** — billing normaliser (discount-presence → UI flags), acceptance-letter date normalisation + dedupe, profile self-edit mutation handlers against the mock.
- **ADRs** — the **payment seam** and the **storage/upload seam** (they crystallize in this cluster; see §6.5.4).

### 2.1 Exact contract types this slice defines

**AUTH — `modules/auth/types/index.ts`** (re-exported through `lib/api/types.ts`; consumed store-side from Foundation):

- `AuthUser` — `_id, email, firstName?, middleName?, lastName?, imageUrl?` (mirror, no re-shape), `phone?, gender?: "Male"|"Female", country?: {isoCode?,name?}|string, state?: {...}|string, city?, address?, createdAt?, isVerified?, roles?: string[], isITStudent?, itVerificationStatus?: string, siwesYear?, institution?, department?, studentCode?, jobTitle?, bio?, altPhone?, timeZone?, lmsRole?: "student"|"instructor"|"both"|null, referralEligible?`
- `LoginRequest {email, password}`, `LoginResponse {user, accessToken, refreshToken}`
- `InvitationStatus` = `"pending"|"accepted"|"rejected"|"cancelled"|"expired"`, `VerifyInvitationResponse`, `AcceptInvitationPayload` — defined for the sealed contract; the accept-invitation *flow* is Plan 012.

**BILLING — `types/api.types.ts` + `types/index.ts`** (as the source: presence of the discount fields **is** the UI toggle):

- `ApiBillingSummary` (totalPaid/totalDue/totalAmount/paymentProgress, `nextPaymentDue?`, `recentPayments?`)
- `ApiBillingPayment {_id, amount, paymentDate}`
- `ApiBillingRegistration` (`course{_id?,name?,nameSlug?,mode?}|null`, `schedule{_id?,startDate?,duration?}|null`, `paymentStatus`, `paymentOption: "installment"|"full"|string`, `totalAmount`, `paidAmount`, `remainingAmount`, `coursePrice?`, `discountAmount?`, `discountKind?: "amount"|"percent"`, `discountValue?`, `discountReason?`, `discountNote?`, `nextPaymentDue?|null`, `payments[]`)
- `ApiBillingBreakdown` (`overall{totalPaid,totalDue,totalAmount,totalDiscount?,paymentProgress,nextPaymentDue?}`, `registrations[]`)
- UI: `PaymentStatus` = `"pending"|"completed"|"cancelled"|"refunded"|"waived"` (adds `refunded`/`waived` beyond the backend `PAYMENT_STATUS`), `BillingPayment {id,amount,paidAt}`, `BillingRegistrationCard` (same discount field set, `cohortLabel`, `paymentProgress` 0–100, `payments[]`), `BillingBreakdown`

**PAYMENT-PROOFS — `types/api.types.ts` + `types/index.ts`** (shapes lifted from the source service file — they were module-wire-shapes living in the wrong file):

- `PaymentProofStatus` = `"pending"|"confirmed"|"rejected"`, `InstallmentStatus` = `"pending"|"paid"|"overdue"|"waived"`
- `PayableRegistration {_id, courseName, totalAmount, paidAmount, remainingAmount, paymentOption?, paymentStatus?}`
- `MyPaymentProof {_id, purpose, courseName?, amountClaimed, confirmedAmount?, screenshotUrl, reference?, status, reviewNotes?, createdAt?, reviewedAt?}` (`purpose` from `PAYMENT_PROOF_PURPOSE`)
- `PlanTranche {id, sequence, amount, dueDate, status, paidAt?, graceEndsAt?}`
- `MyInstallmentPlan {id, enrollmentId, courseName?, origin, planType, status, totalAmount, paidAmount, amountDue, accessStatus, nextDue?, installments[]}` (`origin`/`planType`/`status` from `INSTALLMENT_PLAN_*`; `accessStatus` from `ENROLLMENT_ACCESS_STATUS`)
- `MyPaymentSurface {bank{...}, registrations[], proofs[]}`

**SIWES — `types/api.types.ts` + `types/index.ts`**: `ApiSiwesRegistration {registrationId, siwesDurationMonths?, siwesDurationEditable, schoolName?, institutionName?}` ≡ `SiwesRegistration` (passthrough normaliser kept so screens never import `api.types`).

**ACCEPTANCE LETTERS — `types/api.types.ts` + `types/index.ts`**: `ApiAcceptanceLetter {registrationId, url, refNumber, issuedAt: string, courseName?, institutionName?, durationMonths?, durationEditable?}` → `AcceptanceLetter {…, issuedAt: Date}` (normalised).

**INSTRUCTOR EARNINGS — `types/index.ts`** (no `api.types` — mirror the `/lms/instructor-earnings/*` envelope 1:1): `EarningStream`, `EarningsTotals {pendingNaira, processingNaira, paidNaira}`, `EarningsByKind {baseNaira, variableNaira, bonusNaira}`, `EarningsCohortRow {scheduleId?, course, stream?, startDate?, endDate?, pending, paid}`, `EarningsPayout {_id, totalAmount, status, createdAt?, processedAt?, bankName?}`, `InstructorEarnings {totals, byKind?, cohorts[], payouts[]}`, `BreakdownStudent {name, email?, paidNaira, yourCutNaira?}`, `BreakdownCohort {scheduleId, course, model, isFlat, effectiveSharePct, yourEntitlementNaira, totalRevenueNaira, students[]}`. **No normaliser** — the API already returns the screen shape.

**REFERRALS — `types/index.ts`** (verbatim `/account/*` + payouts envelopes, **no normaliser**): `BankingDetails`, `BankingDetailsPatch = Omit<BankingDetails,"updatedAt">`, `AccountMe` (keeps the `[k: string]: unknown` index signature), `ReferralRecord`, `ReferralsResponse {eligible?, code?, uses?, qualifiedCount?, commissionRate?, totals{pendingNaira,earnedNaira,paidNaira}, records[]}`, `AccountApplicationItem`, `ApplicationsResponse {courses[], internships[], scholarships[]}`, `SetPasswordPayload {currentPassword?, newPassword}`, `PayoutStatus`, `PayoutBankSnapshot`, `Payout {_id, kind, status, totalAmount, currency, bankSnapshot, commissions, processedAt?, createdAt}`, `PayoutsMeta`, `PayoutsListResponse {items[], meta}`.

**ENUMS (mirrored from `smarthub-api/src/constants/index.ts` into `lib/api/constants.ts`)** — `PAYMENT_STATUS` (pending|completed|cancelled), `PAYMENT_OPTION` (installment|full), `PAYMENT_PROOF_STATUS` (pending|confirmed|rejected), `PAYMENT_PROOF_PURPOSE` (course|scholarship|internship|other), `INSTALLMENT_TYPE` (twice|monthly|weekly), `INSTALLMENT_ENFORCEMENT` (chase|suspend), `INSTALLMENT_PLAN_ORIGIN` (scholarship|course), `INSTALLMENT_PLAN_TYPE` (installment|full_upfront), `INSTALLMENT_PLAN_STATUS` (active|completed|defaulted|cancelled), `INSTALLMENT_STATUS` (pending|paid|overdue|waived), `ENROLLMENT_ACCESS_STATUS` (active|suspended_payment|suspended_other|withdrawn), `EARNING_STREAMS` (course|siwes|foundational|scholarship), `COMPENSATION_MODELS` (legacy-50|main-track|micro-intake|foundational), `PAYOUT_STATUS` (pending|processing|paid|failed|cancelled), `PAYOUT_KINDS` (referral|instructor), `INSTRUCTOR_PAY_ITEM_STATUS` (pending|paid|cancelled), `REFERRAL_RECORD_STATUS` (pending|in-progress|earned|paid|clawed-back), `ACCOUNT_SUSPENSION_REASONS` + `ADMISSION_REVOCATION_REASONS` (code+label pairs; used by gate/letter copy). `PAY_ITEM_KINDS`/`SETTLEMENT_MILESTONES`/`INSTRUCTOR_ROLES` are referenced by the instructor-earnings wire but consumed by the Teaching/Admin side — mirror the literals, use them in 011.

### 2.2 Mock seed + handlers (extends Foundation `mockDatabase.ts`)

Seed fixtures must guarantee, beyond Foundation's base account:

- **AuthUser** — full profile surface: the seeded dual-role user carries `gender`, `country/state` as `{isoCode,name}` pairs, `city`, `address`, `createdAt`, `isVerified: true`, `roles`, `lmsRole: "both"`, `referralEligible: true`, **and the SIWES/IT fields** (`isITStudent: true`, `itVerificationStatus: "approved"`, `siwesYear`, `institution`, `department`, `studentCode`), plus `jobTitle`/`bio`/`timeZone` (so Professional tab has content) and a seeded avatar `imageUrl`. A second seeded student is **missing `gender` and `imageUrl`** — one proves the photo gate fires for students, the other drives the "not set" row. Non-eligible staff user for the `eligible:false` referral explainer.
- **Billing** — `ApiBillingBreakdown` with **≥2 registrations**: (a) one `installment` registration carrying a **discount** (`coursePrice` > `totalAmount`, `discountAmount`, `discountKind: "percent"` + `discountValue`, `discountReason: "referral"`, `discountNote`, `nextPaymentDue`) and ≥2 payments; (b) one **full** registration, `paymentStatus` completed, `paymentProgress: 100`; (c) one **waived** registration (`paymentStatus: "waived"`, `remainingAmount` left at full course price so the card's student-facing zero wins). `overall.totalDiscount > 0` so the summary card's "you saved" line renders. `overall.nextPaymentDue` populated.
- **Payment proofs + gate state** — `/payment-proofs/me` bank block (real bank name/account), ≥2 `PayableRegistration`s, ≥1 existing proof in each of a `pending` and a `rejected` (with `reviewNotes`) state. `/payment-proofs/my-plans` returns ≥1 `MyInstallmentPlan` (a two-tranche course plan: paid/overdue/pending, one with `graceEndsAt`) — plus a second *scenario* fixture used by the gate tests (a `suspended_payment` plan, see §7). Also at least one scholarship-`origin` plan (exercises `planType: "full_upfront"`-adjacent rendering).
- **SIWES registrations** — ≥2 `ApiSiwesRegistration` rows: one `siwesDurationEditable: true`, one locked (`false`, no duration), one with `institutionName` but no `schoolName` (exercises the label fallback).
- **Acceptance letters** — ≥2 wire rows sharing one `refNumber` (dedupe → single card) + one legacy row with unique ref; `issuedAt` as ISO string; one row `durationEditable` absent (treated locked).
- **Instructor earnings** — `InstructorEarnings` with nonzero `totals`, `byKind` (all three kinds), ≥2 `cohorts` (one flat-50 with `scheduleId` → detail link; one without `scheduleId` → non-clickable), ≥1 payout; `BreakdownCohort[]` covering **both** a flat model (`isFlat: true`, per-student `yourCutNaira`) and a `main-track`/non-flat model.
- **Referrals** — `AccountMe` (+banking), `ReferralsResponse` with `code`, `uses`, `qualifiedCount`, `commissionRate`, nonzero `totals`, `records[]` spanning `pending`/`in-progress`/`earned`/`paid` (mixed amount vs potentialAmount rows), a payouts list with a `pending` (cancellable) + `paid` row, and banking details seeded so `canRequest` is reachable in demo.

Mock handlers to add/verify behind the seam (verb-shaped; mirror the source services):

- `GET /lms/billing/breakdown` → `ApiBillingBreakdown`; `GET /lms/payments/summary` → `ApiBillingSummary` (legacy compat; see §8)
- `GET /payment-proofs/me`, `GET /payment-proofs/my-plans`, `POST /payment-proofs` (with `screenshotUrl`), `POST /uploads` → **storage seam**: returns `{url}` — mock "stores" the blob (keeps an in-memory URL list, mirrors `downscaleImage` output path)
- `GET /lms/me/siwes-registrations`; `GET /lms/acceptance-letters`; `PATCH /lms/registrations/:id/siwes-duration` (403 when `durationEditable` false — lock honor)
- `GET /lms/instructor-earnings/me`, `GET /lms/instructor-earnings/breakdown`
- `GET /lms/account/me`, `GET /lms/account/referrals`, `GET /lms/account/applications`, `GET|PUT /lms/account/banking`, `POST /auth/set-password`
- `GET /lms/referrals/payouts` (paginated `{items,meta}`), `POST /lms/referrals/payouts` (creates `pending` payout, moves earned→processing), `DELETE /lms/referrals/payouts/:id`
- `PATCH /lms/profile/details` (folds fields into the seeded `AuthUser`; empty `imageUrl` clears), `PATCH /lms/profile/professional`, `GET|PATCH /lms/profile/banking`
- `POST /lms/me/attendance-pin/rotate` → `{rawPin, issuedAt}` (raw PIN surfaced once)
- `POST /lms/class-sessions/:sessionId/check-in` → `{status: "ok"|"already-checked-in"}` with 401/403/410 error branches (check-in page state map)
- `GET /lms/me` (`/auth/me` under the mock) — profile page's `useMe` refresh keeps the persisted `AuthUser` current

### Out of scope (explicitly deferred)

- **Real auth flows** — login/forgot/reset/invitation pages, session lifecycle, 401 single-flight wiring → Plan 012. Only auth *types* and the type-defined set-password/change-password mutations land here (still mock-backed).
- **Notification settings + push module** (`NotificationSettingsCard`) and **`AchievementsList`** (progress module) — the profile tab *triggers* render, but their content comes with the push module and the 004 progress surface; a clean self-gating placeholder holds the slot until then (see §8).
- **Internships payment** (`/internships/me/payment`, `internship` payment-proof purposes) → Plan 010 (the `PAYMENT_PROOF_PURPOSE` enum already carries the values).
- **Admin finance surfaces** (payment-proof review, payout run, discount application, installment-plan builder) — this slice is student/instructor *read* + self-edit; writes come through ops, exactly as the source behaves.
- **Teaching-side compensation model resolution** (`resolve-compensation-model`, `classify-stream`) — the `COMPENSATION_MODELS`/`EARNING_STREAMS` literals are mirrored here but their services land with 011.
- Any real transport/auth work — the seam is mock-backed all the way to 012.
- Re-theming, old design tokens, hand-rolled shadcn primitives, `any`.

## 3. Source reference

Paths under `~/Documents/smarthub/smarthub-core-lms/src/` (reference only — behavior + contracts; never the maroon/orange tokens or Radix/Tailwind-v3 primitives):

- **Auth types**: `modules/auth/types/index.ts`
- **Profile**: `modules/profile/{types absent — patch payloads live in api/service}: api/{profile.service,profile.queries,attendance-pin.service,attendance-pin.queries}.ts`, `config/endpoints.ts`, `components/{AvatarUploader,EditProfileDetailsDialog,BankingTab,ProfessionalTab,AttendancePinSection,ProfilePhotoGate}.tsx`, `app/(app)/profile/page.tsx`
- **Billing**: `modules/billing/types/{api.types,index}.ts`, `api/{billing.service,billing.queries,normalise}.ts`, `config/endpoints.ts`, `components/{BillingPageContent,BillingSummaryCard,RegistrationBillingCard,DashboardBillingWidget}.tsx`
- **Payment-proofs**: `modules/payment-proofs/api/{payment-proofs.service,payment-proofs.queries}.ts`, `config/endpoints.ts`, `components/{PaymentGate,PaymentStatusBanner,InstallmentScheduleCard,PaymentsPageContent}.tsx`
- **SIWES**: `modules/siwes-profile/types/{api.types,index}.ts`, `api/{siwes-profile.service,siwes-profile.queries,normalise}.ts`, `config/endpoints.ts`, `components/SiwesPlacementTab.tsx`
- **Acceptance letters**: `modules/acceptance-letters/types/{api.types,index}.ts`, `api/{acceptance-letters.service,acceptance-letters.queries,normalise}.ts`, `config/endpoints.ts`, `components/{AcceptanceLetterCard,EditSiwesDurationDialog}.tsx`
- **Instructor earnings**: `modules/instructor-earnings/types/index.ts`, `api/{instructor-earnings.service,instructor-earnings.queries}.ts`, `config/endpoints.ts`, `components/{InstructorEarningsPageContent,CohortEarningsDetailContent}.tsx`
- **Referrals**: `modules/referrals/types/index.ts`, `api/{referrals.service,referrals.endpoints}.ts`, `queries/use-my-referrals.ts`, `config/endpoints.ts`, `components/{ReferralsPanel,ProgramShareLink,CopyableCode,DashboardReferralsWidget}.tsx`
- **Shell mounts**: `app/(app)/layout.tsx` (PaymentGate/PaymentStatusBanner/ProfilePhotoGate placement), `app/(app)/check-in/page.tsx`
- **Enums**: `smarthub-api/src/constants/index.ts` (the list in §2.1), `smarthub-api/src/models/{PaymentProof,InstallmentPlan,Installment,ReferralRecord,Payout,InstructorPayItem}.ts`
- **Reuse from 005**: `lib/cloudinary-download.ts` (`downloadFile`/`triggerBlobDownload`) for acceptance-letter download; `lib/image.ts` `downscaleImage` for avatar/proof uploads

Read `node_modules/next/dist/docs/` before writing route pages (Next 16 async-`params` + `use(params)` convention).

## 4. Target files / structure

```
modules/auth/
  types/index.ts                  # AuthUser, LoginRequest/Response, InvitationStatus, VerifyInvitationResponse, AcceptInvitationPayload (types only — flows at 012)
  components/ChangePasswordForm.tsx  # /auth/set-password contract (mock-backed); sessions stay 012

modules/profile/
  api/profile.service.ts          # updateDetails / updateProfessional / get-updateBanking, patch payload types
  api/profile.queries.ts          # useUpdateMyDetails (folds into authStore), useUpdateMyProfessionalProfile, useMyBankingDetails/useUpdateMyBankingDetails
  api/attendance-pin.service.ts
  api/attendance-pin.queries.ts   # useRotateAttendancePin (raw PIN once; component-state only)
  config/endpoints.ts
  types/index.ts                  # ProfileDetailsPatch, ProfessionalProfilePatch, BankingDetails(+Patch), AttendancePinRotation (wire shapes; AuthUser stays in auth)
  components/EditProfileDetailsDialog.tsx
  components/AvatarUploader.tsx
  components/BankingTab.tsx
  components/ProfessionalTab.tsx
  components/AttendancePinSection.tsx
  components/ProfilePhotoGate.tsx

modules/billing/
  api/billing.service.ts
  api/billing.queries.ts          # useBillingBreakdown (select: normaliseBreakdown); useBillingSummary legacy
  api/normalise.ts                # normaliseRegistration + formatCohortLabel + calcProgress + normaliseBreakdown
  config/endpoints.ts
  types/api.types.ts
  types/index.ts
  components/BillingPageContent.tsx
  components/BillingSummaryCard.tsx
  components/RegistrationBillingCard.tsx
  components/DashboardBillingWidget.tsx

modules/payment-proofs/
  api/payment-proofs.service.ts   # thin now: submitProof → POST /uploads (storage seam) then POST /payment-proofs
  api/payment-proofs.queries.ts   # useMyPaymentSurface, useMyInstallmentPlans, useSubmitPaymentProof (invalidates both keys)
  config/endpoints.ts
  types/api.types.ts              # MyPaymentSurface, MyPaymentProof, MyInstallmentPlan, PlanTranche, PayableRegistration
  types/index.ts                  # re-exports + date-normalising UI aliases (dueDate/createdAt → Date at select)
  components/PaymentsPageContent.tsx
  components/InstallmentScheduleCard.tsx
  components/PaymentGate.tsx      # shell paywall (ALWAYS_OPEN routes; reads only the installment-plans key)
  components/PaymentStatusBanner.tsx

modules/siwes-profile/
  api/siwes-profile.service.ts
  api/siwes-profile.queries.ts    # useMySiwesRegistrations (60s staleTime; invalidated by the letter dialog mutation)
  api/normalise.ts                # passthrough
  config/endpoints.ts
  types/api.types.ts
  types/index.ts
  components/SiwesPlacementTab.tsx

modules/acceptance-letters/
  api/acceptance-letters.service.ts  # list + updateSiwesDuration (403 on locked)
  api/acceptance-letters.queries.ts  # useAcceptanceLetters (normalise + dedupe by refNumber|url|registrationId), useUpdateSiwesDuration (invalidates letters + siwes keys)
  api/normalise.ts                # issuedAt: string → Date
  config/endpoints.ts
  types/api.types.ts
  types/index.ts
  components/AcceptanceLetterCard.tsx
  components/EditSiwesDurationDialog.tsx

modules/instructor-earnings/
  api/instructor-earnings.service.ts  (verbatim envelope, no normalise)
  api/instructor-earnings.queries.ts  # useMyInstructorEarnings, useMyInstructorRevenueBreakdown (refetchOnWindowFocus)
  config/endpoints.ts
  types/index.ts                  # EarningStream, EarningsTotals, EarningsByKind, EarningsCohortRow, EarningsPayout, InstructorEarnings, BreakdownStudent, BreakdownCohort
  components/InstructorEarningsPageContent.tsx
  components/CohortEarningsDetailContent.tsx

modules/referrals/
  api/referrals.service.ts        # /account/* + /auth/set-password + referrals payouts (verbatim)
  api/referrals.endpoints.ts      # re-export of config/endpoints
  config/endpoints.ts
  queries/use-my-referrals.ts     # useMyReferrals, useBankingDetails, useMyPayouts(page,size), useRequestPayout, useCancelPayout
  types/index.ts                  # all §2.1 referral shapes (verbatim)
  components/ReferralsPanel.tsx
  components/ProgramShareLink.tsx
  components/CopyableCode.tsx
  components/DashboardReferralsWidget.tsx

app/(app)/
  .../layout.tsx                  # (extend) mount PaymentGate → PaymentStatusBanner → ProfilePhotoGate inside the shell
  profile/page.tsx                # tabs: overview/professional|siwes|banking|notifications|achievements|security (Security rendered in-tab); ?tab= deep-link
  billing/page.tsx                # mode branch: student → BillingPageContent; instructor → InstructorEarningsPageContent
  billing/cohort/[scheduleId]/page.tsx  # → CohortEarningsDetailContent(scheduleId)
  payments/page.tsx               # → PaymentsPageContent
  refer-and-earn/page.tsx         # → ReferralsPanel
  check-in/page.tsx               # self-contained token+session check-in state machine

lib/api/types.ts                  (extend: auth/billing/payment-proofs/siwes/letter/referral wire types already mirrored by Foundation — add any gaps)
lib/api/constants.ts              (extend: the §2.1 enum set — most are in Foundation already)
lib/api/mock/mockDatabase.ts      (extend: §2.2 finance/account fixtures)
lib/api/mock/index.ts             (register/handle the §2.2 endpoints incl. /uploads + storage seam)

tests (colocated, Vitest):
  modules/billing/api/normalise.test.ts
  modules/acceptance-letters/api/normalise.test.ts
  lib/api/mock/profile-mutations.test.ts     # PATCH /profile/details folds into the seeded AuthUser; banking put + clear-avatar
  lib/api/mock/payment-gate.test.ts          # suspended_payment plan → paywall branch; open-access → passthrough

docs/adr/adr-009-payment-seam.md
docs/adr/adr-009-storage-upload-seam.md
```

## 5. shadcn components to use (via MCP, `base-vega` preset)

- `card` — the bulk of this cluster (billing cards, profile cards, referral panels, gate/paywall screens)
- `badge` — payment-status posture, discount pill, SIWES chip, referral/payout statuses, mode
- `button`, `input`, `label`, `textarea` — every self-edit form (edit-details dialog, professional, banking, proof submit)
- `dialog` + `alert-dialog` — edit-profile/avatar-preview dialogs; sign-out, phone-unlock, PIN-rotate, remove-photo confirmations
- `tabs` — profile tab strip and referral tab bar (`shadcn` `Tabs` for profile; referral bar follows the source's underline tabs — re-author on `Tabs` for a11y unless the source pattern is kept, see §8)
- `avatar` — identity card (`AvatarUploader`)
- `progress` — billing summary + per-registration payment progress + installment-plan progress
- `select` — gendered/gender + SIWES-duration + proof "what is this for?" pickers (replace the source's raw `<select>`)
- `skeleton` — page/panel loading states (billing, earnings, referrals, payments, profile tabs)
- `separator` — card row dividers where the source uses `divide-y`
- `sonner` (dependency) — toasts for saved actions (copy code/account, payout request, profile saved, proof submitted)
- lucide icons via import: `CreditCard`, `Receipt`, `Tag`, `GraduationCap`, `KeyRound`, `Camera`, `Share2`, `Wallet`, `FileText`, `Download`, `Lock`, `AlertTriangle`, `UploadCloud`, … (no re-registration)

> `table` rows are plain `<table>` inside `Card` (`overflow-x-auto`), as the source does — not the shadcn table primitive.

## 6. Steps

1. **Types first**: add/extend `modules/auth/types/index.ts` (AuthUser + auth envelopes), the §2.1 billing/siwes/letter/referral/instructor-earnings `types/` files, and a `modules/payment-proofs/types/` (lift the shapes out of the source's service file). Confirm the mirrored enums exist in `lib/api/constants.ts` (Foundation), add any gaps.
2. **Extend the mock seed + handlers** (`mockDatabase.ts`, `mock/index.ts`) per §2.2 — finance/account fixtures, `/uploads` storage seam, and every §2.2 endpoint (including the 403 on locked duration-edit and the check-in error branches).
3. **Profile module — API layer**: service (patch payloads in `types/`), `useUpdateMyDetails` (folds patched fields into the cached `AuthUser` in `authStore`, invalidates `["auth","me"]`), professional + banking queries, attendance-pin rotate query.
4. **Profile components**: identity `Card` + `EditProfileDetailsDialog` (phone behind unlock) + `AvatarUploader` (pick → preview → `downscaleImage` → `/uploads` via the seam → PATCH; remove → `imageUrl: ""`), `AttendancePinSection` (rotate-once; PIN held in component state, copy-to-clipboard, formatDateTime caption), `ProfessionalTab`, `BankingTab` (dirty-diff patch, account-number ≥4 validation), `ProfilePhotoGate` (student-without-photo, non-dismissable, clears on upload).
5. **Billing module**: `normalise.ts` (cohort label, progress calc, **discount fields pass through undefined-as-undefined** so presence is the render toggle), `useBillingBreakdown` (`select: normaliseBreakdown`), `BillingSummaryCard` ("Paid in full" state, `totalDiscount` "you saved ₦X", contact-admin email CTA), `RegistrationBillingCard` (status badge map incl. waived-as-paid-in-full, discount pill + struck-through `coursePrice`, plan label + progress, payment history list), `BillingPageContent`, `DashboardBillingWidget` (self-gating). Keep `useBillingSummary` deprecated-path (see §8).
6. **Payment-proofs module**: `useMyPaymentSurface`/`useMyInstallmentPlans`/`useSubmitPaymentProof` (upload-then-post over the seam; invalidate both keys), `InstallmentScheduleCard` (every tranche: paid/waived/overdue/pending tones, grace caption, "Pay this" → prefill), `PaymentsPageContent` (transfer-to bank block + copy, one proof form, tranche prefill + clear, submissions list with `reviewNotes` + status tones), `PaymentGate` + `PaymentStatusBanner`.
7. **Shell mounts**: extend the `(app)` layout to stack `PaymentGate` → `PaymentStatusBanner` (inside the resolved/authenticated area; the banner only during grace, gate only when fully suspended and off the `ALWAYS_OPEN` routes), → `ProfilePhotoGate`.
8. **SIWES + acceptance-letters**: siwes passthrough normaliser + query (`60s` stale), `SiwesPlacementTab` rows (label fallback, editable/locked, "admin regenerates the letter"), acceptance `normalise` (`issuedAt → Date`) + **dedupe** in `useAcceptanceLetters`, `AcceptanceLetterCard` (single-row + stacked variants, view/download via `cloudinary-download`), `EditSiwesDurationDialog` (1–12, invalidates letters + siwes keys).
9. **Instructor-earnings**: verbatim `types/index.ts`, `useMyInstructorEarnings` + `useMyInstructorRevenueBreakdown` (refetch on window focus), page content (totals tiles, byKind split, per-cohort table → `/billing/cohort/[scheduleId]`, payout history, bank-nudge from `useBankingDetails`), cohort detail content (flat vs non-flat copy, who-paid table + your-cut column, totals footer).
10. **Referrals**: verbatim `types/index.ts`, service + `use-my-referrals.ts` queries (banking, payouts paginated, request/cancel with invalidation), `CopyableCode`, `ProgramShareLink` (env/subdomain origin resolution, copy + WhatsApp), `ReferralsPanel` (code-pill header, `eligible:false` explainer, Share/Earnings/Ledger/Payouts tabs, ledger amount vs potentialAmount rendering), `DashboardReferralsWidget` (self-gating).
11. **Route pages**: `/profile` (tab strip + `?tab=` sync, **Security as an in-place tab** — deviation from legacy, which routed password change to a separate `/profile/security` page; we render the `ChangePasswordForm` as a tab so the trigger is a real `TabsTrigger`, not a dead link), `/billing` mode branch, `/billing/cohort/[scheduleId]` (Next 16 params), `/payments`, `/refer-and-earn`, `/check-in` (token+session state machine incl. 401/403/410 mapping, StrictMode single-fire ref, auto-redirect). Verify the async-`params` convention against the bundled Next docs.
12. **Tests**: billing normaliser (discount-presence toggles, cohort-label formatting, progress clamp), acceptance normalise + dedupe, mock profile PATCH handlers (fold into AuthUser, banking put, avatar clear), payment-gate branch on access-status.
13. **ADRs**: `adr-009-payment-seam.md` + `adr-009-storage-upload-seam.md` (see §6.5.4).
14. **Verify**: `npm run typecheck`, `npm run lint`, `vitest run`, dev-boot walkthrough (§7).

## 6.5 Architecture brief (see `ARCHITECTURE.md`)

1. **Deepen** — deletion-test each module:
   - **Billing**: the depth is `normalise.ts` — cohort-label formatting (date ± duration, `NaN`-safe), 0–100 progress clamping, and the **discount-presence contract** (`discountAmount > 0` is the *only* toggle; fields are passed through undefined, never defaulted to 0). Delete `normalise.ts` and every card must reinvent date/price/presence logic — it earns its keep. **Port it as the module's one deep normaliser**.
   - **Acceptance-letters**: the depth is **one date normalisation + one business rule** — `issuedAt: string → Date` (so render code never guesses `Date|string`), and the **ref-number dedupe** (post-Architecture-A, N registrations share one applicant-level letter → one card). Both live in the query, keeping the service a plain read.
   - **Referrals + instructor-earnings**: the *opposite* verdict — the API already returns tiny, screen-ready envelopes (`/account/*`, `/lms/instructor-earnings/*`). A normaliser would be a shallow pass-through, so **type them directly** (verbatim, `AccountMe` keeps its `[k: string]: unknown` index signature) and skip the normaliser file. Do not invent one for symmetry.
   - **Payment-proofs**: the source kept its wire shapes in `payment-proofs.service.ts`; moving them to `types/` is the standard per-domain shape (they're module wire-types living in the wrong file). Date fields normalised to `Date` at query `select`, so `InstallmentScheduleCard`/`PaymentGate` never parse ISO strings.
   - **Profile**: deliberately normaliser-free (the `AuthUser` projection *is* the interface); its depth is the **self-edit fold** — the mutation writes the store's cached `AuthUser` so the whole shell re-renders without a refetch, then invalidates `["auth","me"]` for everyone else.
2. **Seams** — the two the cluster crystallizes:
   - **Payment seam (real — two+ adapters already exist).** Waiver, installment (tranche schedule), full-upfront, and "contact admin / manual bank transfer" all surface the same learner-side concepts: amount due, next due/grace, access status. `PaymentGate`/`PaymentStatusBanner`/`InstallmentScheduleCard`/`PaymentsPageContent` read **only** the `MyInstallmentPlan` shape (`amountDue`, `nextDue`, `accessStatus`, `installments[]`) + `BillingBreakdown.overall` — so a future Paystack/Flutterwave adapter sits behind the vertical line, and the 402-paywall semantics stay a pure read of `ENROLLMENT_ACCESS_STATUS`. No provider adapter is introduced yet (the mock IS the adapter); the seam is the *contract* the UI consumes.
   - **Storage/upload seam (real — the second adapter).** Avatar upload, payment-proof receipt upload, acceptance-letter download/view, curriculum PDF (from 005) — every one is "put bytes `/uploads` → get URL → store URL / preview / download". `downscaleImage` (profile) and `cloudinary-download`/`use-previewable-url` (letters/proofs) already exist as separate leaves; this slice wires them to a single `uploads` seam on the mock and keeps the shared client behind it. Do **not** build a provider abstraction — one seam method `upload(file): Promise<string>` on the API client, mock-backed now, Cloudinary-backed at 012.
3. **Testability** — normalisers are pure and public (the interface is the test surface): billing discount/format matrix fed by wire fixtures from the mock; acceptance date + dedupe. The gate is testable through the seam: the mock's `my-plans` handler returns a `suspended_payment` plan → paywall branch; any open plan → passthrough. Profile self-edits are testable by exercising the mock `PATCH /profile/details` handler and asserting the seeded `AuthUser` folded (the same assertion the query's `onSuccess` implements in the store). No jsdom needed.
4. **ADR** — two records, both pre-announced in `ARCHITECTURE.md` §"Known seams":
   - `adr-009-payment-seam.md` — the learner-facing payment surface reads only `MyInstallmentPlan` + `BillingBreakdown.overall`; waiver/installment/full/manual live behind that one contract; gates derive from `ENROLLMENT_ACCESS_STATUS`, never from provider calls.
   - `adr-009-storage-upload-seam.md` — one `/uploads`-shaped seam (`upload(file) → URL`) on the shared client served by the mock now and object storage at 012; profile/proofs/letters all route through it; preview/download reuse `downscaleImage`/`cloudinary-download`.

## 7. Acceptance checks

- [x] `npm run typecheck` passes
- [x] `npm run lint` passes
- [x] `vitest run` passes (billing normaliser, acceptance normalise+dedupe, profile PATCH-fold, payment-gate branch; wire fixtures from the mock)
- [x] `npm run dev` boots; profile / billing / payments / refer-and-earn / check-in render fully mock-driven (all 200; build also confirms `useSearchParams` pages sit under Suspense)
- [ ] **Profile**: identity card renders the seeded `AuthUser` (verified check, SIWES chip + year, student code, joined date, country/state/city as names); `EditProfileDetailsDialog` saves → toast → **store + mock updated** AND the header re-renders without a refetch; phone is locked until the unlock confirm; avatar pick→preview→upload→PATCH and remove flow works; banking + professional tabs save via dirty-diff; attendance PIN rotates once, shows raw PIN once, copy works
- [ ] **Billing**: summary card shows `totalPaid / totalAmount`, progress bar, "you saved ₦X" line (discount fixture), "Paid in full" state; registration cards render the **discount pill + struck-through `coursePrice` + note**, installment plan label + progress, and a **waived** card displays `₦0` remaining (ledger untouched) with "Waived"; payment history lists rows
- [ ] **Payments + gate**: `/payments` shows the transfer-to bank block, tranche schedule (paid/overdue/pending with grace "access pauses on"), "Pay this" prefills the single proof form; submitting posts a proof → submission appears with `pending` badge; a `rejected` proof shows its `reviewNotes`; the `suspended_payment` fixture drives the **paywall** on non-`ALWAYS_OPEN` routes and nothing on `/payments`/`/billing`/`/profile`; a nudge banner shows only during grace
- [ ] **SIWES + letters**: profile SIWES tab lists rows (editable pencil vs "Locked — contact admin"); duration edit in 1–12 dialog → toast → SIWES tab + letter(deduped) lists refresh; letter card shows view/download and the dashboard tile self-gates with zero letters; locked registration returns 403
- [ ] **Instructor earnings** (instructor mode on `/billing`): totals tiles, byKind split, per-cohort table → cohort detail (/billing/cohort/[scheduleId]) with who-paid + your-cut columns (flat) vs base+threshold copy (non-flat); payout history table; bank-details nudge surfaces when balance > 0 and no banking
- [ ] **Referrals**: code-pill header + copy; Share tab renders 3 program links (resolved origin + `?ref=`), commission copy; Earnings tiles match `totals`; Ledger rows show amount vs potentialAmount and status badges; Payouts: request creates a pending payout (earned→processing), cancel removes a pending one; banking CTA hands off to `/profile?tab=banking`; `eligible:false` fixture shows the explainer card; dashboard widget self-gates without a code
- [ ] **Check-in**: no/token-session → "missing", success → "You're marked present" + auto-redirect, 401/403/410 map to invalid/not-enrolled/expired; StrictMode double-effect guard
- [ ] No `any`; component classes/styling from the new `base-vega` tokens (no maroon/orange, no Radix/Tailwind-v3 imports)
- [x] ADRs `adr-009-payment-seam.md` + `adr-009-storage-upload-seam.md` recorded (files follow the `000N` sequence → `0010-payment-seam.md`, `0011-storage-upload-seam.md`)

## 8. Open questions / to confirm

1. **Two banking editors (source-faithful?).** The source has *both* a profile banking editor (`PATCH /lms/profile/banking`) and the referrals reading a different sub-doc (`GET|PUT /lms/account/banking`); instructor-earnings nudges via the referrals one. Recommend porting both verbatim (each page owns its sub-doc) and noting the duplication in the ADR rather than unifying the two resources — the unification is an ops/API change. Confirm.
2. **Profile tabs without their owning modules.** `AchievementsList` (progress) and `NotificationSettingsCard` (push) aren't ported by this slice's source list. Recommend rendering the two tab triggers with a small self-gating "coming with the next slice" placeholder so the tab strip is complete, and filling them with the progress/push surfaces as those land. Confirm vs. hiding the tabs until then.
3. **`useBillingSummary` + `/lms/payments/summary`.** The source kept the hook exported but deprecated (its stage filters diverge from `/billing/breakdown`). Recommend: handler exists for contract fidelity, new UI reads only `useBillingBreakdown().data.overall` — drop the endpoint entirely if you'd rather not carry the dead surface. Confirm.
4. **Referral tab bar.** Source hand-rolls an underline `role=tablist`. Recommend re-authoring on shadcn `Tabs` for a11y/keyboard parity since `Tabs` is on our component list; the profile tab strip already uses it. Confirm vs. matching the source's custom underline bar.
5. **Security as a tab, not a page.** The legacy split profile into `/profile/security` and turned the Security trigger into a styled link-out, which broke the tab paradigm and hid password change behind a second hop. We deviate: render `ChangePasswordForm` (**auth module**, `/auth/set-password` contract, mock-backed; current+new password) as a real in-place Security tab with `?tab=security` deep-link, so there is no `/profile/security` route at all. Session rotation/refresh folds into the 012 auth work. Confirm.
6. **Change-password contract**: the referrals `SetPasswordPayload` uses `/auth/set-password`; use the same endpoint for the profile security form (single identity mutation the mock serves) rather than a separate change-password route. Confirm.
7. **Photo gate in demo.** Source gates *students* (`roles` includes `student`) without a photo. Recommend seeding the primary demo user with an avatar (gate closed in the happy path) and proving the gate via a second no-photo student fixture — no one gets paywalled out of the demo by the gate on first boot. Confirm.
8. **Vitest harness**: 005 introduces Vitest+`npm test`; this plan's tests are pure-node and follow it. If 005 hasn't landed, this slice brings the harness in (same scope as 005 §8.3). Confirm.