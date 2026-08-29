# PLAN 010 — Programs + AI + Help (Internships / Tech Scholarship / Oreo / Help / Branding)

**Status:** Confirmed 2026-08 — scope decisions recorded in §8 (all recommended options accepted).
**Owner:** SmartHub port
**Depends on:** 001 Foundation (mock database, wire types/enums, API-client seam, stores/utils/providers), 002 App shell & route stubs, 003 Navigation chrome (nav exposes the routes this slice fills). 009 (billing/siwes/acceptance-letters) is not a blocker but shares the mock's `ping`s generators; internship payment proof touches `/uploads` which Foundation stubbed.

---

## 1. Goal

Port the "programs + AI + help" cluster end-to-end against the mock, all reads through the Foundation API-client seam: the **internship** workspace (tasks + check-ins + payment banner/payment page), the **Tech Scholarship** dashboard card (stage / tier / SIWES coupon + share banner), **Oreo** the AI assistant (canned exchange at the mock with a real UI: markdown answer rendering, "How I got this" tool-steps panel, usage meter), the **Help** resource library (grouped by category, mode-filtered), and **Branding** (logos + socials drop-in for the shell). Plus the self-contained **check-in** page, grouped here conceptually. In the mock phase every surface renders meaningfully with zero hardcoded fixtures in page components.

## 2. Scope

### In scope

- **Internships module** (`modules/internships/`) — `ApiInternshipTask` / `ApiInternshipCheckIn` / `ApiInternshipPayment` / `ApiInternship` wire types (re-export from Foundation), UI types (`InternshipTaskStatus`, `InternshipTask`, `InternshipCheckIn`, `InternshipPayment`, `Internship` with dates as `Date`), `normaliseInternship` + `normalisePayment` (incl. pure task `progressPercent` derived calc where the wire leaves it off), service + queries (`useMyInternship`, `useMyInternshipPayment`, `useUpdateInternshipTask`, `useSubmitCheckIn`, `useSubmitInternshipPaymentProof`), `config/endpoints.ts`, and the components: `InternshipDashboardCard`, `InternshipPaymentBannerCard` (dashboard), `InternshipWorkspacePageContent` (the `/internships` workspace), `InternshipPaymentPageContent` (the `/internships/me/payment` page).
- **Tech Scholarship module** (`modules/tech-scholarship/`) — `SCHOLARSHIP_TRACKS`/`ApiScholarshipTrack` + `SCHOLARSHIP_STAGES`/`ApiScholarshipStage` enums + `ApiScholarshipApplication` wire type; UI types `ScholarStage` / `ScholarSummary` (with server-derived `isActiveScholar` just rendered, not recomputed client-side); `normaliseScholar` (track/stage label maps, active-stage set); service + `useMyScholarship` query (returns `null` when not a scholar — the card render-nothings); `ScholarshipPhotoGate`, `ScholarshipShareBannerDialog` (personalised share-banner generator), `TechScholarshipCard` (dashboard tile).
- **Oreo module** (`modules/oreo/`) — `AskStep` / `AskUsageSummary` / `AskAnswer` / `AskHistoryTurn` / `AskTurn` types (`index.ts` only — this module has no separate wire `api.types.ts`; the ask surface is a hypermedia/AI seam, see §6.5); `oreo.service` (ask + usage behind the same API-client seam, with an SSE-style stream reader kept for the real backend), `oreo.queries` (`useOreoQuestion`, `useOreoUsage`), `config/endpoints.ts`, **`modules/oreo/lib/markdown.ts`** — the pure `renderMarkdown` util (headings, lists, code fences, links, pipe tables) + `AnswerMarkdown` (sanitises via `isomorphic-dompurify`), `OreoPageContent` (transcript, composer, suggestions, usage meter, New chat, buffered stream-state machine), plus a "How I got this" tool-steps panel driven off `AskAnswer.data`.
- **Help module** (`modules/help/`) — `ApiHelpResource` wire type + `HelpResource` / `HelpCategoryGroup` UI types, `normaliseHelpResource` + pure `groupByCategory`, service + `useHelpResources(mode)` query, `HelpPageContent` (mode-filtered resource cards, category skeleton + empty states).
- **Branding module** (`modules/branding/`) — `BrandLogoVariant` / `BrandSocial` / `Branding` types, `branding.service` + `useBranding` (24h stale, fall-back to bundled assets), `config/endpoints.ts`. Consumed by the shell's `logo` + social links (mount point confirmed with 003).
- **Check-in page** — the self-contained `/check-in?token&session` page (QR-scan one-shot): POSTs to `class-sessions/:id/check-in` behind the seam, renders the ok/already/expired/not-enrolled/invalid/missing-params/error states; auto-redirect home on success. **Already shipped + QA'd under Plan 009** (`app/(app)/check-in/`, mock router `post /lms/class-sessions/:sessionId/check-in`) — 010 keeps the acceptance check as an already-met item, no build work.
- **Mock seed extension + handlers** — internship (tasks + check-ins + payment), scholarship application (an admitted/enrolled one with a coupon + a track), a **canned** Oreo conversation + usage (the mock answers without any real AI), help resources grouped by category, branding logos/socials, and the check-in POST (see §2.2).
- **Unit tests** — pure normalisers (internship, scholarship), pure helpers (`markdown.ts` matrix: headings/tables/lists/fences/escaping; internship `progressPercent` calc), and the **canned Oreo answer handler** (fixed question → a deterministic `AskAnswer` with tool steps + usage).
- **ADR** — record the **Oreo-as-seam** decision (stub behind the API-client seam until a real backend; see §6.5.4).

### 2.1 Contract types this slice consumes

**WIRE (`api.types` — re-export Foundation's mirrored smarthub-api wire types, don't redefine):**

- `ApiInternshipTask` — `_id`, `internship`, `title`, `description?`, `status: "todo" | "in_progress" | "submitted" | "done"`, `dueDate?`, `order`, `submissionUrl?`, `submissionNote?`, `submittedAt?`, `reviewNotes?`
- `ApiInternshipCheckIn` — `weekOf?`, `summary`, `blockers?`, `hoursLogged?`, `submittedAt?`, `mentorFeedback?`
- `ApiInternshipPayment` — `applicationId`, `applicantName`, `applicantEmail`, `fee`, `paidAmount`, `paymentStatus: "pending" | "completed" | "cancelled"`, `paymentProofUrl?`, `paymentProofSubmittedAt?`, `paymentReference?`, `paymentConfirmedAt?`, `bank { bankName?, accountName?, accountNumber?, paymentInstructions? }`
- `ApiInternship` — `_id`, `internName`, `internEmail`, `product { key, name }`, `mentor { name, email?, title? }`, `startDate?`, `endDate?`, `status: "active" | "completed" | "terminated"`, `progressPercent`, `checkIns[]`, `certificateUrl?`, `certificateRefNumber?`, `certificateIssuedAt?`, `completedAt?`, `tasks[]?`
- `SCHOLARSHIP_TRACKS` / `ApiScholarshipTrack` (string), `SCHOLARSHIP_STAGES` = `applied | aptitude-completed | stage-2-invited | stage-2-submitted | interview-scheduled | interview-completed | admitted | rejected | enrolled | withdrawn` / `ApiScholarshipStage`
- `ApiScholarshipApplication` — `_id`, `cohort`, `track`, `stage`, `awardedTier?`, `siwesCouponCode?`, `createdAt?`
- `ApiHelpResource` — `_id`, `title`, `description?`, `type: "video" | "document" | "link"`, `url`, `thumbnailUrl?`, `category`, `audience: "student" | "instructor" | "all"`, `order`, `createdAt`

**UI (`index` — dates normalised to `Date` so render code never guesses `Date | string`):**

- `InternshipTaskStatus`, `InternshipTask` (id, title, description?, status, dueDate?: Date, order, submissionUrl?, submissionNote?), `InternshipCheckIn` (id, weekOf?: Date, summary, blockers?, hoursLogged?, submittedAt?: Date, mentorFeedback?), `InternshipPayment` (dates as `Date`, `bank` object), `Internship` (id, internName, product, mentor, startDate?/endDate?/certificateIssuedAt?/completedAt? as `Date`, status, progressPercent, checkIns, certificateUrl?, certificateRefNumber?, tasks)
- `ScholarStage`, `ScholarSummary` (id, cohort, trackLabel, stage, stageLabel, awardedTier?, siwesCouponCode?, `isActiveScholar`)
- `HelpResource` (id, title, description?, type, url, thumbnailUrl?, category), `HelpCategoryGroup` (category, items[])
- **Oreo (`modules/oreo/types/index.ts`, no separate wire file):** `AskStep` (tool, args?, result { ok?, data?, error? }), `AskUsageSummary` (tokensUsed, tokensLimit, tokensLeft, unlimited, blocked, monthStart), `AskAnswer` (answer, data: AskStep[], toolsUsed[], generatedQuery?, usage?, monthUsage?), `AskHistoryTurn`, `AskTurn` (id, role: user|assistant, content, answer?, error?, streaming?, status?)
- **Branding (`modules/branding/types/index.ts`):** `BrandLogoVariant` (svg, png, png2x), `BrandSocial` (key, label, url, iconUrl), `Branding` (logos { primary, color, dark }, socials[])

### 2.2 Mock seed + handlers the screens read (extends Foundation `mockDatabase.ts`)

Seed fixtures must guarantee, beyond Foundation's base data:

- **Internship** — one `ApiInternship` (`status: "active"`, `progressPercent > 0`) for the seeded intern, with `tasks` covering every status (`todo`, `in_progress`, `submitted`, `done`), `checkIns` with `mentorFeedback` on at least one, and a matching `ApiInternshipPayment` in `pending` with `paymentProofUrl` **absent** (so the payment banner prompts "Upload proof") and bank details populated. A second payment fixture (`fee: 0` or `completed`) exists to prove the banner's self-gating branches.
- **Scholarship** — one `ApiScholarshipApplication` for the seeded user at `stage: "enrolled"`, `track: "python-ai"`, `awardedTier: "full"`, `siwesCouponCode` minted (so the card shows stage + tier + coupon), plus a second record at an inert stage (e.g. `applied`) used to prove `isActiveScholar: false` render-nothing.
- **Oreo — canned, no real AI**: the mock holds a small canned-response table keyed on question substrings (e.g. "assignments", "my balance"). The `ask` handler returns a **deterministic `AskAnswer`** for a preseeded suggestion question — `answer` as markdown (with a heading, a pipe table and a list so the markdown renderer is exercised), `data: AskStep[]` (2–3 steps for the tool-steps panel: `tool`, `args`, `result { ok: true, data }`), `toolsUsed`, and `monthUsage` (a `AskUsageSummary` close to the limit, `blocked: false`, `unlimited: false`, so the meter bar shows real tokens-left). Any other question resolves to a canned fallback answer. `usage` returns the same summary. No OpenAI/SSE transport — the mock resolves the promise after a short artificial delay to let streaming states render.
- **Help** — ≥3 categories, each with resources spanning `type` `video` / `document` / `link`, with `audience` across `student` / `instructor` / `all` so the mode filter meaningfully trims the list (a category visible only to one mode).
- **Branding** — a full `Branding` payload (`logos.primary/color/dark`, `socials` with reachable/public sample `iconUrl`s + `url`s).
- **Check-in** — already shipped under 009: mock `class-sessions/:id/check-in` POST returning `{ status: "ok" | "already-checked-in" }` for the seeded `sessionId`, all terminal states + auto-redirect QA'd. No new work.

Mock handlers to add/verify behind the seam (verb-shaped, mirroring `smarthub-api` + legacy LMS):

- `GET /lms/internships/me` → `ApiInternship | null`
- `PATCH /lms/internships/me/tasks/:taskId` → update status/submission (can only reach `in_progress`/`submitted`)
- `POST /lms/internships/me/check-ins` → append a check-in
- `GET /lms/internships/me/payment` → `ApiInternshipPayment | null`
- `POST /lms/internships/me/payment-proof` -> sets `paymentProofUrl` (+ `/uploads` stub already in Foundation)
- `GET /scholarship-applications/me` → `ApiScholarshipApplication | null`
- `GET /scholarship-applications/me/banner` (force flag) → `{ squareUrl, wideUrl, generatedAt, suggestedCaption? }` (static sample images)
- `POST /lms/oreo/ask` (+ `POST /lms/oreo/ask/stream`) → **canned** `AskAnswer`
- `GET /lms/oreo/usage` → `AskUsageSummary`
- `GET /lms/help?mode=student|instructor` → `ApiHelpResource[]`, filtered by `audience`
- `GET /platform/branding` → `Branding`
- `POST /lms/class-sessions/:sessionId/check-in` → `{ status: "ok" | "already-checked-in" }`

### Out of scope (explicitly deferred)

- **Real AI / OpenAI / SSE transport for Oreo** — the mock is canned; the real agent loop + streaming swap lands with Plan 012 (the API-client seam + the `streamAsk` reader stay as the deferred adapter surface).
- **Scholarship photo cropping/upload polish** (`react-easy-crop` crop UX) — the `ScholarshipPhotoGate` ships as **upload-persist without crop** this slice; full crop UI/deps land with the real backend in 012 [decided §8.5]. The `/uploads` seam is already stubbed in Foundation.
- **Instructor branch / teaching of `/courses`** — the Tech Scholarship card links into `/courses` (already rendered by Plan 005); no course CRUD here (Plan 011).
- **Branding consumption beyond the shell** `logo` + socials — other branded surfaces (email/PDF headers) are out of scope here.
- **Admin/AskQueryLog audit view** — the raw tool-step payload is surfaced read-only in a "How I got this" panel; a server-side audit log is deferred to the real backend.
- **Oreo `useOreoQuestion` non-streaming path parity** — source only wires the stream path; ship the seam function, wire the page through the canned mock's resolved promise.
- Any real transport/auth work, re-theming, old design tokens, hand-rolled shadcn primitives, `any`.

## 3. Source reference

Paths under `~/Documents/smarthub/smarthub-core-lms/src/` (reference only — behavior/contracts, never the design system or Radix/Tailwind-v3 primitives):

- `modules/internships/types/{api.types,index}.ts`, `modules/internships/api/{internships.service,internships.queries,normalise}.ts`, `modules/internships/config/endpoints.ts`
- `modules/internships/components/{InternshipDashboardCard,InternshipPaymentBannerCard,InternshipPaymentPageContent,InternshipWorkspacePageContent}.tsx`
- `modules/tech-scholarship/types/{api.types,index}.ts`, `modules/tech-scholarship/api/{tech-scholarship.service,tech-scholarship.queries,normalise}.ts`, `modules/tech-scholarship/config/endpoints.ts`
- `modules/tech-scholarship/components/{ScholarshipPhotoGate,ScholarshipShareBannerDialog,TechScholarshipCard}.tsx`
- `modules/oreo/types/index.ts`, `modules/oreo/api/{oreo.service,oreo.queries}.ts`, `modules/oreo/config/endpoints.ts`
- `modules/oreo/components/{OreoPageContent,AnswerMarkdown}.tsx`, `modules/oreo/lib/markdown.ts`
- `modules/help/types/{api.types,index}.ts`, `modules/help/api/{help.service,help.queries,normalise}.ts`, `modules/help/config/endpoints.ts`, `modules/help/components/HelpPageContent.tsx`
- `modules/branding/types/index.ts`, `modules/branding/api/{branding.service,branding.queries}.ts`, `modules/branding/config/endpoints.ts`
- `app/(app)/check-in/page.tsx`, `app/(app)/internships/{page,me/payment/page}.tsx`, `app/(app)/oreo/page.tsx`, `app/(app)/help/page.tsx`

Read `node_modules/next/dist/docs/` before writing route pages (Next 16 async-`params` / `use(params)` + `useSearchParams` conventions; `notFound()`).

## 4. Target files / structure

```
modules/internships/
  api/internships.service.ts        # getMine, updateTask, submitCheckIn, getMyPayment, submitPaymentProof
  api/internships.queries.ts        # useMyInternship, useMyInternshipPayment, useUpdateInternshipTask,
                                    #   useSubmitCheckIn, useSubmitInternshipPaymentProof
  api/normalise.ts                  # normaliseTask/CheckIn/Payment/Internship + progressPercent calc
  config/endpoints.ts               # ME, TASK(id), CHECK_INS, PAYMENT, PAYMENT_PROOF
  types/api.types.ts                # re-export wire types from @/lib/api/types.ts
  types/index.ts                    # InternshipTaskStatus/Task/CheckIn/Payment/Internship + re-exports
  components/InternshipDashboardCard.tsx
  components/InternshipPaymentBannerCard.tsx
  components/InternshipWorkspacePageContent.tsx
  components/InternshipPaymentPageContent.tsx

modules/tech-scholarship/
  api/tech-scholarship.service.ts   # getMine, getBanner, setPhoto, uploadPhoto
  api/tech-scholarship.queries.ts   # useMyScholarship
  api/normalise.ts                  # normaliseScholar (track/stage labels, active-stage set)
  config/endpoints.ts
  types/api.types.ts                # SCHOLARSHIP_TRACKS/_STAGES/ApiScholarshipTrack/_Stage/ApiScholarshipApplication
  types/index.ts                    # ScholarStage, ScholarSummary + re-export
  components/TechScholarshipCard.tsx
  components/ScholarshipShareBannerDialog.tsx
  components/ScholarshipPhotoGate.tsx

modules/oreo/
  api/oreo.service.ts               # ask, usage (+ SSE streamAsk reader kept for real backend)
  api/oreo.queries.ts               # useOreoQuestion, useOreoUsage
  config/endpoints.ts               # ASK, ASK_STREAM, USAGE
  types/index.ts                    # AskStep, AskUsageSummary, AskAnswer, AskHistoryTurn, AskTurn
  lib/markdown.ts                   # renderMarkdown (pure, no deps)
  components/AnswerMarkdown.tsx     # sanitise (isomorphic-dompurify) + render
  components/OreoPageContent.tsx    # transcript, composer, suggestions, usage meter, tool-steps panel

modules/help/
  api/help.service.ts               # list(mode)
  api/help.queries.ts               # useHelpResources(mode) -> HelpCategoryGroup[]
  api/normalise.ts                  # normaliseHelpResource + groupByCategory (pure)
  config/endpoints.ts               # LIST
  types/api.types.ts                # ApiHelpResource (re-export) or define + re-export
  types/index.ts                    # HelpResource, HelpCategoryGroup
  components/HelpPageContent.tsx

modules/branding/
  api/branding.service.ts           # get
  api/branding.queries.ts           # useBranding (24h stale; bundled fallback)
  config/endpoints.ts               # BASE
  types/index.ts                    # BrandLogoVariant, BrandSocial, Branding

app/(app)/
  internships/page.tsx                    -> InternshipWorkspacePageContent
  internships/me/payment/page.tsx         -> InternshipPaymentPageContent
  oreo/page.tsx                           -> OreoPageContent
  help/page.tsx                           -> HelpPageContent
  # scholarship: no route (card mounts on the 004 dashboard grid)  [§8.2]
  # check-in: shipped under 009 (no work)                           [§8.1]

lib/api/mock/mockDatabase.ts           (extend: §2.2 fixtures)
lib/api/mock/index.ts                  (register/handle the §2.2 endpoints + canned oreo table)

tests (colocated, Vitest — introduced in Plan 005):
  modules/internships/api/normalise.test.ts
  modules/tech-scholarship/api/normalise.test.ts
  modules/oreo/lib/markdown.test.ts
  modules/oreo/api/canned-oreo.test.ts
  modules/help/api/normalise.test.ts

docs/adr/adr-010-oreo-as-seam.md
```

> **Ownership/positioning note:** the dashboard tiles (`InternshipDashboardCard`, `InternshipPaymentBannerCard`, `TechScholarshipCard`, plus the `OreoPageContent` header live-usage) are **owned by their modules** and composed by the Plan 004 dashboard — this slice builds the tiles, not the dashboard grid.

## 5. shadcn components to use (via MCP, `base-vega` preset)

- `card`, `button`, `badge`, `separator` — every dashboard tile, the payment page, the workspace, the scholarship card (stage/tier/coupon badges), help cards
- `avatar` — intern/mentor avatars in the workspace
- `progress` — internship workspace + dashboard progress bars
- `dialog` — internship check-in ("How's it going?") composer, scholarship share-banner dialog, "How I got this" tool-steps panel (or `collapsible`/`sheet` for the panel — confirm)
- `textarea` — Oreo composer + check-in composer (multi-line)
- `skeleton` — loading states on help list, internship workspace, payment page
- `scroll-area` — Oreo chat transcript, tool-steps panel
- `tabs` — internship workspace (Tasks / Check-ins) if the source splits lanes; optional
- `tooltip`, `dropdown-menu` — as needed for banner/tier actions

> **Not a shadcn primitive:** the markdown renderer (`modules/oreo/lib/markdown.ts` + `AnswerMarkdown`). There's no registry item for a constrained markdown→HTML util (the repo intentionally has no markdown dependency); it ports as a pure leaf util + a sanitising wrapper, mirroring Plan 005's `rich-text` treatment. `isomorphic-dompurify` is the sanitisation dep.

## 6. Steps

1. **Extend the mock seed** (`mockDatabase.ts`): add the §2.2 fixtures — internship (tasks across statuses + check-ins + groupable payment + self-gating branches), scholarship (enrolled/full/coupon + an inert-stage record), help (mode-varied categories), branding (full payload + sample assets), check-in session(s), and the **canned Oreo conversation/usage table**.
2. **Register the mock handlers** (`mock/index.ts`): all §2.2 endpoints, including the canned Oreo `ask`/`stream`/`usage` (deterministic `AskAnswer` with tool steps + monthUsage) and the check-in POST. Keep the canned `ask` mapping a pure, exported function so Step 13 can unit-test it directly.
3. **Internships — types + normalise**: `types/api.types.ts` (re-export the Foundation wire types), `types/index.ts` (UI shapes, dates as `Date`), and `api/normalise.ts` — `normaliseTask/CheckIn/Payment/Internship`, a pure `toDate` helper, and the **pure `progressPercent` derived calc** → a `computeProgress(tasks)` helper (source stores `progressPercent`, but the helper is the tested seam when a task's `done` count disagrees; keep it exported and exercised).
4. **Internships — endpoints/service/queries**: `config/endpoints.ts`, `internships.service.ts` (behind the seam), `internships.queries.ts` (`useMyInternship`, `useMyInternshipPayment`, `useUpdateInternshipTask` — invalidate `mine`; `useSubmitCheckIn` — invalidate `mine`; `useSubmitInternshipPaymentProof` — invalidate `payment` + `mine`).
5. **Internships — components**: `InternshipDashboardCard` + `InternshipPaymentBannerCard` (both self-gating: render null on loading/no-data/completed/fee-zero intern payments), `InternshipWorkspacePageContent` (product/mentor header, `Progress`, tabs or stacked Tasks list + Check-ins, per-task status/submission actions, check-in dialog), `InternshipPaymentPageContent` (fee snapshot, paid-amount + proof state, bank details, upload-proof flow, confirmation states).
6. **Tech Scholarship — types + normalise**: `types/` (schema-track → free-string `ApiScholarshipTrack`; `SCHOLARSHIP_STAGES` enum), `normaliseScholar` (track/stage label maps, `ACTIVE_STAGES` = {admitted, enrolled} → `isActiveScholar`; the set is **server-derived logic** the mock already encodes — the normaliser just reflects the wire, not recompute it client-side).
7. **Tech Scholarship — endpoints/service/queries + components**: `useMyScholarship` (returns `null` when absent; render-nothing), `TechScholarshipCard` (track, cohort, stage badge, tier badge (humanised from `awardedTier`), SIWES-coupon badge, Courses CTA, share-banner trigger), `ScholarshipShareBannerDialog` (fetch/present square+wide banner + editable suggested caption, force-refresh), `ScholarshipPhotoGate`.
8. **Oreo — types + service/config**: `types/index.ts` (all six Ask shapes), `config/endpoints.ts`, `oreo.service.ts` — `ask` + `usage` through the seam, plus the `streamAsk` SSE-reader function kept for the real backend (not exercised in the mock; type-only in the mock phase). `oreo.queries.ts` (`useOreoQuestion`, `useOreoUsage`).
9. **Oreo — markdown util**: port `modules/oreo/lib/markdown.ts` — pure `renderMarkdown` (escape-first; headings, bold/italic/inline-code, links restricted to http(s), fenced code, ordered/unordered lists, pipe tables). No component imports; unit-tested directly.
10. **Oreo — components**: `AnswerMarkdown` (isomorphic-dompurify sanitise + `dangerouslySetInnerHTML`), `OreoPageContent` (transcript in `ScrollArea`, user/assistant bubbles, composer `Textarea` with Enter-to-send, suggestion chips, `UsageMeter`, `New chat`, buffered streaming state machine driven off the mock's resolved promise after a short delay, and the **collapsed read-only "How I got this" tool-steps panel** rendering `AskAnswer.data`) [§8.3].
11. **Help — types + api**: `types/`, `api/normalise.ts` (`normaliseHelpResource` + pure `groupByCategory` preserving `order`), service (`list(mode)`), `useHelpResources(mode)`, then `HelpPageContent` (category sections, video/document/link card variants, skeleton + empty states).
12. **Branding — types + api**: `types/index.ts`, `branding.service.ts`, `useBranding` (24h stale, GC 48h, `retry: 1`, bundled-asset fallback while loading/on error). **Swap the shell's hardcoded `Logo` SVGs + any social refs to `useBranding`** so the chrome is data-driven with the bundled fallback [§8.4].
13. **Route pages**: wire the thin `(app)` pages — `/internships`, `/internships/me/payment`, `/oreo`, `/help`. (Check-in + its page + mock handler shipped under 009; no work here.)
14. **Unit tests**: internship normalise + `computeProgress`, scholarship normalise (labels + `isActiveScholar` for each stage), `markdown.ts` matrix (headings/tables/list/fence/escaping/link-scheme guard), **canned Oreo answer handler** (preseeded question → expected `AskAnswer` with tool steps + `monthUsage`), help `groupByCategory` (mode filter + order).
15. **ADR**: `adr-010-oreo-as-seam.md` — Oreo is a **hypermedia/AI seam**: a stub behind the same API-client seam during the mock phase, `streamAsk` + telemetry surface kept as the deferred adapter, no UI depends on whether the backend is canned or real.
16. **Verify**: `npm run typecheck`, `npm run lint`, `vitest run`, dev-boot walkthrough (§7).

## 6.5 Architecture brief (see `ARCHITECTURE.md`)

1. **Deepen** — deletion-test the source. The one genuine leaf of complexity is **Oreo's `markdown.ts`**: a pure, dependency-free renderer (escape-first, constrained subset, pipe tables). Keep it a leaf util in `modules/oreo/lib/`, ported exactly and unit-tested directly — it does not deserve an abstraction. Second is the **internship `progressPercent`**: keep the derived calc as a small pure helper (`computeProgress(tasks)`) next to the normaliser so render code never recomputes percentages inline. Everything else (internship normalise → `toDate`, scholarship label maps, help grouping) is straightforward data mapping; normalisers stay thin and exported so queries are `map(normalise…)` in the `select`. **`isActiveScholar` is server-derived** — the mock already encodes the active-stage rule; the UI just renders the normalised boolean, never recomputes the admission logic client-side.

2. **Seams** — **no new seams beyond the existing API-client one.** The mock adapter (Foundation) already covers the paid/marker-data surface; this slice adds handlers, not a new seam. Two hypersurface worth *naming*, not abstracting: (a) **Oreo is a hypermedia/AI seam** — a natural-language surface whose traffic is inherently different from `get/post` CRUD, but it deliberately **stays behind the same API-client seam** (`oreo.service.ask`/`usage`, `streamAsk` kept as the deferred SSE adapter). One adapter today (canned mock), one later (real agent) → note it, don't build middleware now. (b) **branding** could be a tiny seam (remote vs bundled fallback) but is handled by the query's stale/fallback config — a hook, not an interface.

3. **Testability** — the pure surfaces are the test surface: internship normalise + `computeProgress`, scholarship normalise (label + active-stage coverage for every stage), `markdown.ts` (escaping/table/list/fence/link-scheme matrix — critical because it feeds `dangerouslySetInnerHTML`), help `groupByCategory` (order + mode filter). The **canned Oreo answer handler is exported from the mock and unit-tested** against a preseeded question, so the mock's "AI" is a verified fixture rather than an ad-hoc string blob.

4. **ADR** — yes: record **Oreo-as-seam** (`adr-010-oreo-as-seam.md`) — a stub behind the same API-client seam until the real backend; `streamAsk`/SSE kept as the deferred adapter; UI decoupled from canned-vs-real. (A scholarship `isActiveScholar` server-derived note can fold into the same ADR or its own small entry.)

## 7. Acceptance checks

- [x] `npm run typecheck` passes
- [x] `npm run lint` passes
- [x] `vitest run` passes (internship + scholarship normalise, `computeProgress`, markdown matrix, canned Oreo handler, help grouping)
- [x] `npm run dev` boots; the route surfaces (internships ×2, oreo, help) + dashboard tiles are **fully mock-driven** — no hardcoded fixtures inside page components; every read through the seam
- [x] `/internships` workspace renders the placement header + `Progress`, the task list (each status badge, per-task submit/mark-in-progress actions), the check-ins list (+ check-in dialog writing through the mock), and no placement → self-gating empty state
- [x] Internship **payment banner** prompts "Upload proof" for the pending, fee>0 fixture; self-gates (null) for the completed / fee-0 / no-data cases; the `/internships/me/payment` page shows fee/paid/bank details + upload-proof flow that writes the proof through the mock (awaiting-confirmation state; banner stops nudging once a proof is in)
- [x] **Tech Scholarship card** renders track + cohort + stage badge + humanised tier ("Full scholarship") + "SIWES coupon ready" for the enrolled/full/coupon fixture; render-nothings for the inert-stage fixture; share-banner dialog opens with square/wide + editable caption
- [x] **Oreo** renders the seeded suggestion → a canned `AskAnswer` where the markdown renders (table + list + heading), the usage meter shows `tokens used · N left` with the bar near-limit, and the **"How I got this" tool-steps panel** lists the canned `AskStep`s; other questions fall back to the canned reply; New chat clears the transcript
- [x] `/help` groups resources by category (mode filter trims the instructor-only category while in instructor mode); video card embeds, document/link cards render CTA
- [x] **Branding** supplies `logos` (primary/color/dark) + `socials` to the shell `logo`/social block with the bundled-asset fallback while loading
- [x] `/check-in` — **already-met under 009** (valid token+session → "You're marked present" + auto-redirect; seeded already-done session → "already checked in"; missing params → missing-params state; 401/403/410 mapped). No new work.
- [x] **Canned Oreo handler** covered by a passing unit test (deterministic output, not an ad-hoc string); the mock resolves after a short delay (streaming states render)
- [x] No `any`; component classes/styling from the new `base-vega` tokens (no maroon/orange, no Radix/Tailwind-v3 imports)
- [x] ADR recorded (`docs/adr/0012-oreo-as-seam.md` — numbering continues the 008/009 chain)

**QA fixes during walkthrough:**
- Mock seam returned live singletons → in-place mutations made a later response reference-equal to the cached query value, so React Query's structural sharing dropped the update (payment proof never rendered). `apiClient` `exec` now deep-copies every response (`lib/api/client.ts`).
- Payment page state machine extended: pending (bank + upload) → proof submitted → **awaiting confirmation** (shows reference + submitted date); the dashboard banner self-gates once a proof is in.
- All `/mock/*` fixture media (course/webinar/banner images, avatars, help videos + posters, help PDFs) were generated under `public/mock/` — they previously 404'd in the live surfaces.

## 8. Open questions / to confirm — **ALL RESOLVED 2026-08 (recommended options accepted):**

1. ✅ **DECIDED: collapsed read-only panel.** Render a collapsed, read-only "How I got this" section under each assistant bubble from `AskAnswer.data`; trivially hidden later.
2. ✅ **DECIDED: no route.** `TechScholarshipCard` mounts on the 004 dashboard grid only; no `/scholarship` page.
3. ✅ **DECIDED: shell is data-driven.** 010 swaps `Logo`'s hardcoded SVGs (and socials, if present) for `useBranding`, bundled-asset fallback while loading/on error.
4. ✅ **DECIDED: upload-persist, no crop.** Photo gate renders + persists a photo URL; `react-easy-crop` deferred to 012.
5. ✅ **DECIDED: single resolved `AskAnswer` + short delay.** Mock resolves deterministically after ~600 ms so streaming states render; page consumes via a thin adapter; `streamAsk` reader stays as the deferred SSE adapter.
