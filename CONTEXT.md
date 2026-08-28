# SmartHub LMS — Domain Context (GLOSSARY)

Seed glossary for the port. Terms below are the shared, ubiquitous
language used across plans, module `types/`, `configs/nav.ts`, mock
fixtures and screens. Keep every new module's terminology consistent
with these; sharpen entries (never silently diverge) as modules land.

> "A plan must be confirmed before code" — glossary entries start sparse
> and get more precise as each slice is built. Update this file with any
> term a screen introduces that isn't here.

## Learning objects

- **Course** — the catalogue-level entity students enrol into
  (`name`, `nameSlug`, `category`, `difficulty`, `courseKind`). Has no
  schedule of its own.
- **Schedule / Cohort** — one concrete run of a course: a `startDate` /
  `endDate`, a `mode` (`online | onsite | hybrid`), and the roster of
  enrolled students. Referred to interchangeably as a *cohort* in
  teaching surfaces; `Schedule` is the domain object.
- **Enrollment** — the link between a student (`User`) and a
  `Schedule`; owns `enrollmentDate`, `status`, and **module progress**.
  Distinct from *Payment* (a payment may exist before enrolment is
  granted).
- **Module** — a unit within a course, with a `title`, `order`, `status`,
  and its own `recording[]`, `material[]`, `assignment[]` children.
  Carries per-cohort `cohortStatus` (`not-started | in-progress |
  completed`).
- **Recording** — a video lesson inside a module. Watched-state
  (`watched`) drives *module progress*.
- **Material** — a non-video resource inside a module (PDF, slides,
  exercise, reference) with a `category` and `links[]`.
- **Assignment** — a piece of work a student submits, owned by a module;
  has `dueDate`, `totalPoints`, `allowLateSubmission`, and a `status`
  (`draft | submitted | graded | overdue | returned`). Instructor can
  also *assign* it individually (via conversation threads).
- **Submission — Assessment / Grade** — `Submission` is the student's
  answer (file/text/url) + its `version` history + the instructor's
  `grade` (score/rubric/letter) and `feedback`. Not the same as
  *Assignment*.
- **Attendance** — per `Schedule`-session rows marked against the
  roster; each row records `status` (`present | absent | late |
  excused`) and a `source` (`manual | auto`) for precedence.

## People & roles

- **User** — an auth account (`AuthUser`); `roles[]` (`student`,
  `instructor`, `admin`, …) decide nav + capability. `lmsRole`
  (`student | instructor | both | null`) derives the sidebar mode.
- **Student** — a `User` with an enrolment in some cohort.
- **Instructor** — a `User` who teaches one or more `Schedule`s; may
  carry compensation (earnings/payouts).
- **Intern** — a `User` on a separate **Internship** track (stipend,
  mentor, check-ins) rather than the course track.
- **SIWES** — the Nigerian industrial-training placement programme;
  `User.isITStudent` + letter/school verification gate the SIWES
  surface (Acceptance Letter).

## Billing

- **Payment** — a single money transfer toward a `Registration`
  (`amount`, `paymentDate`, `paymentStatus`).
- **Registration** — a course purchase attached to a `Schedule`; owns
  `paymentOption` (`installment | full`), `totalAmount`, `paidAmount`,
  `remainingAmount`, `nextPaymentDue`, and its `payments[]`.
- **Installment Plan** — the schedule/terms for splitting a
  `Registration`; `installment[Type|Enforcement|Origin|Status]` enums.
- **Payment Proof** — a processed remittance with `purpose`
  (`enrollment | installment`), `status` (`pending | approved |
  rejected`), uploaded by the student.
- **Waiver / Discount** — `discountAmount`, `discountKind`
  (`amount | percent`), `discountReason`/`note` on a `Registration`.

## Programs & community

- **Scholarship** — an award `Application` with `track`, `stage`
  (`applied → … → enrolled`), `awardedTier`, optional `siwesCouponCode`.
- **Referral** — a `referralEligible` User inviting others; yields
  `ReferralRecord`s and, once paid out, a `Payout`.
- **Payout / Earnings** — instructor compensation streams
  (`EARNING_STREAMS`, `compensationModels`, `payItems`, `settlements`).
- **Webinar** — a one-off live presentation (`date`, `speakers`,
  `liveLink`/`recordingLink`, `isAvailable`, `reservationsOpen`).

## Messaging & activity

- **Conversation / Thread** — a message container (`type`: `direct |
  group | assignment | announcement | support`) whose
  `participants[]` + `lastMessage` + `unreadCount` drive the Inbox.
- **Message** — one item in a `Conversation`.
- **Notification** — a discrete event the app surfaces (grade posted,
  material added, announcement); has `type`, `createdAt`, `read`.
- **Activity** — the cross-resource feed of recent user actions.
- **Calendar Event** — a dated item with `type`, `source` (`manual |
  auto`), `scope` (`global | course | schedule | module | assignment`),
  `isCancelled`.

## Data-source & architecture

- **Data-source seam** — `lib/api/client.ts`; the one interface module
  services call (`get/post/put/patch/delete/getBlob`). UI-first it is
  **mock-backed**; at Plan 012 the axios adapter swaps behind it.
- **Wire types** — `lib/api/wire.types.ts`; string-`_id` shapes mirroring
  `smarthub-api` Mongoose models, the single source of truth for what
  the API returns.
- **Mock database** — `lib/api/mock/mockDatabase.ts`; wire-faithful seed
  fixtures the mock handlers read.
