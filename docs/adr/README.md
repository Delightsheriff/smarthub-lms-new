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
