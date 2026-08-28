# Architecture & Deepening — Porting Companion

Companion to `plans/PORTING.md`. While `PORTING.md` says **what** we port and
in **what order**, this says **how** we keep the new codebase testable and
AI-navigable as we build it: **deepen each module as we port it, don't port
verbatim.**

The working rules from `PORTING.md` still apply — plan per slice, confirm
before coding, shadcn via MCP, keep the new design system. This document adds
the architecture brief that every module plan must carry.

## Vocabulary (use exactly)

From `/codebase-design`. Don't drift into "component," "service," "API,"
"boundary."

- **Module** — anything with an interface + implementation (scale-agnostic).
- **Interface** — everything a caller must learn to use it: signature plus
  invariants, ordering, error modes, config, perf.
- **Implementation** — the module's body. **Adapter** = a concrete thing
  filling a slot at a seam.
- **Depth** — leverage per unit of interface. **Deep** = lots of behaviour
  behind a small interface. **Shallow** = interface ≈ implementation.
- **Seam** — the location where the interface lives; where behaviour can be
  altered without editing that place.
- **Leverage** — what callers get from depth (pay once, use across N sites).
- **Locality** — what maintainers get from depth (change/bugs/knowledge
  concentrate in one place).

## Principles we apply on every port

1. **The deletion test.** Before porting a source module, ask: if it lived as
   a thin pass-through, would deleting it concentrate complexity (good — it's
   earning its keep) or just move it (shallow — deepen it)? Port the
   *complexity*, not the shallow wrapper.

2. **The interface is the test surface.** Callers and tests cross the same
   seam. If we want to test *past* an interface, the module is the wrong
   shape. Port each module so it's testable *through* its interface on day
   one, not retrofit-tested later.

3. **Depth is a property of the interface, not the implementation.** A deep
   module may be internally composed of small, swappable parts — they just
   aren't part of the interface. Internal seams are fine and private.

4. **One adapter = hypothetical seam; two = real one.** Introduce a seam only
   where something actually varies. Don't invent provider abstractions for a
   single implementation.

5. **Accept dependencies, don't create them; return results, don't produce
   side effects.** Ported modules favour injected deps and pure outputs so
   they're natural to test.

## Known seams worth deepening while we port

These are the spots in the old code where a seam earns its keep (more than
one actual adapter/variation, or the highest future-change rate):

- **Payment provider** — currently the source hardcodes "contact admin"
  (`BillingSummaryCard`), waivers, installment plans. A single payment seam
  lets Paystack/Flutterwave/manual/waiver slot behind one interface.
- **Upload / file storage** — Cloudinary appears in profile photos, payment
  receipts, submission files, recordings, material uploads. A storage seam
  (a real one: multiple upload/delivery paths already exist today) centralises
  upload → URL → preview/download.
- **Realtime transport** — socket.io only exists for notifications/messaging;
  content is REST. Keep the thin `useSocket` seam but don't over-abstract.
- **Normalisation taproot** — `learning/normaliseModuleContent` +
  `normaliseAssignment` are shared by courses / assigned-modules /
  assignments. Preserve as a single deep module (huge locality win) rather
  than re-implementing per caller.
- **Nav config vs nav rendering** — `configs/nav.ts` data is genuinely
  separate from layout rendering; keep that seam clean.

## Artifacts the architecture work depends on

These don't exist anywhere yet and must be established early (Foundation):

- **`CONTEXT.md`** (repo root) — the LMS **domain glossary**. Names the
  concepts (Course, Cohort, Schedule, Module, Recording, Material,
  Assignment, Submission, Assessment/Grade, Enrollment, Roster, Attendance,
  Payment/Installment-Plan, Payment-Proof, Scholarship, Internship, Referral,
  Webinar, Conversation/Thread, Notification, Activity, SIWES placement,
  Acceptance Letter). Architecture recommendations must use **these terms**,
  not class names. Created lazily, sharpened as modules land; updated the
  moment a fuzzy term is pinned down during porting.
- **`docs/adr/`** — Architecture Decision Records. Record decisions as they
  crystallize (module-per-domain shape, shared axios client + single-flight
  refresh, normalise-in-query `select`, Zustand+TanStack split, keep the new
  design system, contract source = smarthub-api, payment seam, storage seam,
  etc.). Future architecture reviews read these and don't re-litigate settled
  calls.
- **`DESIGN.md`** — the design-system spec is effectively `plans/PORTING.md`
  + the shadcn `base-vega` preset + `app/globals.css` tokens. We won't
  duplicate it; porting plans reference it.

## How each module plan carries this brief

Extend the plan template (`000-template.md`) with an **Architecture brief**
section covering:

1. **Deepen** — deletion-test the source module; where's the real complexity?
2. **Seams** — any adapter to slot? (one = note it, don't abstract; two =
   introduce the seam).
3. **Testability** — the interface design that makes it testable through the
   seam; what new tests the slice ships with (and which existing pattern they
   follow).
4. **ADR** — does a decision crystallize here worth recording? (record it in
   the slice, or explicitly "no new ADR".)

Add the **Architecture brief** as a distinct acceptance item, alongside
typecheck/lint/build.

## Review cadence

After each major slice lands, run a **quick `/improve` audit pass** over that
slice's new code (read-only, evidence + `file:line`): correctness, test
coverage/design, and architecture (did we actually deepen, or shuffle shallow
modules?). Findings become refinements to the *next* slice's brief — so
architecture debt doesn't compound.

Occasionally (not every slice), run the full `/improve-codebase-architecture`
review flow over the newest code and present the HTML candidate report to the
user; picked candidates go through `/grilling` + `/domain-modeling`, and the
resulting decisions land back as plans + ADRs.

## Non-negotiables

- Never copy the old design system or its Radix/Tailwind-v3 components.
- No `any`; strict TS; Zod for runtime narrowing.
- Typecheck + lint (+ build where feasible) pass at every checkpoint.
- Confirm each plan's scope with the user before executing. Never assume.
