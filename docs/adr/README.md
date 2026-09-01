# Architecture Decision Records

One ADR per load-bearing decision. New ADRs always win over older ones;
a later ADR that reverses an earlier one must say so explicitly.

| # | Decision | Status |
|---|----------|--------|
| 0001 | UI-first: mock data source behind the API seam (auth/API last) | Accepted |
| 0002 | Contract source = `smarthub-api` (mirrored wire types + enums) | Accepted |
| 0003 | Module-per-domain structure | Accepted |
| 0004 | State split: Zustand (UI) + TanStack Query (server) | Accepted |
| 0005 | Keep the new `base-vega` design system | Accepted |
| 0006 | Route groups `(app)`/`(auth)` + gating layering; `headers` over `proxy` | Accepted |
| 0007 | Nav data / nav rendering seam (`configs/nav.ts` pure data; collapse via `sidebarStore`) | Accepted |
| 0008 | The dashboard is a composition point, not a module | Accepted |
| 0009 | Student learning surface shares one normalisation taproot | Accepted |
| 0010 | Learner-facing payment surface is one seam (`MyInstallmentPlan` + `BillingBreakdown`, gates derive from `accessStatus`), not a provider call | Accepted |
| 0011 | Uploads/downloads/previews route through one storage seam (`uploadFile`/`downscaleImage`/`downloadFile`) | Accepted |
| 0012 | Oreo-as-seam: AI assistant behind the API-client seam (canned mock now, `streamAsk`/SSE deferred adapter; safe-subset markdown; scholarship server-derived gate; branding with bundled fallback) | Accepted |
| 0013 | Instructor teaching aggregates and attendance seam (independent attendance polling, shared submission grading adapter, server/mock-side rollups) | Accepted |
