# 0017. Watermarked Streaming and Entitlement Seam

**Status:** Accepted  
**Date:** 2026-09-15  
**Context:** Plan 013 (Self-Paced Learning). Self-paced courses support direct-hosted video playback, signed time-limited asset downloads, pass-membership access, and referral link revenue attribution.

## Decisions

1. **Watermarked Streaming Seam (`LessonVideo` & `LessonDownload`):**
   Direct video streaming and downloads use single-use, time-limited tokenized URLs fetched via `/lms/self-paced/playback/:lessonId` and `/lms/self-paced/download/:lessonId`. Expiry is handled by automatic refresh polling (`useLessonPlayback` / `useLessonDownload`).
2. **Unified Learner Normalisation (`normaliseSelfPacedCourse`):**
   Raw wire models from `smarthub-api` are normalized at the API boundary into UI-first objects (`SelfPacedCourse`, `SelfPacedLesson`), computing progress metrics, next-lesson pointers, and entitlement denials upfront.
3. **Instructor Revenue Share & Referral Attribution (`useMyInstructorLinks` & `useMySelfPacedEarnings`):**
   Instructor referral links, attributed orders, and revenue share ledgers operate through dedicated TanStack Query hooks, presenting multi-currency financial metrics and payout states without altering core LMS shell state.

## Consequences

- Direct media URLs remain secure and ephemeral.
- Navigation chrome dynamically adapts based on `useLearnerShape()` without duplicating domain logic.
