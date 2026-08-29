# ADR 0012 — Oreo-as-seam (AI assistant behind the API-client seam)

- **Status:** Accepted
- **Date:** 2026-08 (Plan 010)

## Context

Oreo is a generative AI assistant: the UI surface is a chat transcript
with markdown answers, a "How I got this" tool-steps panel and a monthly
usage meter. In the mock phase there is no real backend, so "what Oreo
returns" would normally be bolted directly into the page as hardcoded
fixtures. That couples the transcript UI to canned strings and makes the
eventual real backend (SSE streaming, tool calls, usage accounting) a
rewrite of the page rather than a swap of one adapter.

The legacy client made this genuinely hard to swap: its `oreo` page
imported `event-source-polyfill` directly, used `zustand` slices for
transcript/stream, and skipped the shared API seam entirely.

## Decision

1. **Oreo is a hypermedia/AI seam behind the same API-client seam as
   every other module.** `oreo.service.ask(question) → Promise<AskAnswer>`
   is the only way a screen gets an answer. During the mock phase that
   resolves `lib/api/mock/oreo-canned.ts` (a deterministic, pure,
   unit-tested canned response). At Plan 012 the same signature is backed
   by the real API.
2. **`streamAsk`/SSE transport is kept as the deferred adapter.** The
   endpoints and wire shapes exist (`/lms/oreo/ask` + `/ask/stream`,
   `AskAnswer`); the streaming reader is deliberately not wired up yet,
   so the page's loading state (a delayed pending bubble) stays the
   single UI contract.
3. **Pages never depend on whether the backend is canned or real.**
   No `import "@/lib/api/mock/oreo-canned"` outside the mock barrel; the
   transcript is component state, the answer is just `AskAnswer`.
4. **`AskAnswer.data: AskStep[]` is a first-class part of the answer.**
   The collapsed "How I got this" developer view renders it read-only;
   tool names, args and result `ok/data/error` are all the backend can
   provide. (No scholarship-specific note here: `isActiveScholar` is
   already server-derived in `normalise`/selector terms.)

## Consequences

- **Positive:** the chat UI is byte-identical across canned-vs-real;
  only the service impl differs. Telemetry/usage (`monthUsage`,
  `warnings`) attach to `AskAnswer` unmodified.
- **Positive:** `oreo-canned.ts` is pure and unit-tested (deterministic
  per question, near-limit usage meter, no HTML in canned bodies), so
  the mock can't silently drift from what a page expects.
- **Positive:** markdown rendering is a **safe-subset** parser in the
  module (headings, bold/italic, inline+fenced code, lists, pipe tables,
  http(s)-only links) — no `dangerouslySetInnerHTML`, no full CommonMark.
- **Negative:** streaming UX (token-by-token) is deferred to the real
  adapter; the mock only *renders* the pending state via a route delay.
- **Trade-off accepted:** one-shot `ask` may be faster to build but
  complicates late binding; the fuller seam costs little here and is the
  one surface the real backend must honour.

## Also in this ADR

- **Scholarship**: `isActiveScholar` is derived server-side from the
  application stage (enrolled/admitted); the module does not re-derive
  it in the UI — the dashboard tile render-noths on `null`.
  Consequently the seeded mock ships an inert `applied` record alongside
  the enrolled one to prove the gate holds.
- **Branding**: runtime branding (`GET /platform/branding`) with
  bundled-fallback is a slice of the same swap story — the shell's
  `Logo` paints from `useBranding`, resolving to the bundled SVGs while
  loading or on error.