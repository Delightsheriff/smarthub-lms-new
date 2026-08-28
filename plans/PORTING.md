# SmartHub Core LMS → New Codebase — Porting Context

This is the **master context** for porting the SmartHub LMS product into
`smarthub-lms-new`. Everything we build is incremental, split into section
plans under `plans/`. Read this first; each numbered plan in this folder
expands on one slice.

> **Companion:** read **`plans/ARCHITECTURE.md`** alongside this — it defines
> how we **deepen each module as we port** (deep modules, seams, locality,
> testability), the shared vocabulary, and the `CONTEXT.md` / `docs/adr/`
> artifacts. `PORTING.md` is *what/where/order*; `ARCHITECTURE.md` is *how we
> keep it good*.

> **Workflow rule:** We work incrementally. Before starting any slice,
> confirm scope with the user. Never assume; ask. One plan per deliverable.
> We use shadcn components throughout (via the shadcn MCP) — follow the
> new design system down to the needle.

---

## 1. Where things live

| Item | Path |
| --- | --- |
| This repo (port **target**) | `~/Documents/smarthub-lms-new` |
| Old LMS (**source**, reference) | `~/Documents/smarthub/smarthub-core-lms` |
| Sibling apps (context) | `~/Documents/smarthub/*` |
| Section plans | `plans/` (here) |
| shadcn MCP config | `opencode.json` (project root) |

The old codebase stays **outside** this repo and is used only as a reference
for behavior, API contracts, module structure and screens. We **do not** copy
its design tokens, its Radix-based shadcn components, or its Tailwind v3
implementation.

---

## 2. The target stack (what we build on)

| Concern | Value |
| --- | --- |
| Framework | Next.js **16.2.6** (App Router) — has breaking changes vs training data; read `node_modules/next/dist/docs/` before coding |
| React | 19.2.4 |
| Styling | Tailwind **v4** (CSS-first, no JS config) |
| UI kit | **shadcn/ui `base-vega`** preset, primitives via **Base UI** (`@base-ui/react`), icons `lucide` |
| Design system | The new codebase's existing `app/globals.css` tokens + shadcn preset. **Keep as-is; do not re-import the old maroon/orange.** |
| State | Zustand (add) |
| Server state | TanStack Query v5 (add) |
| HTTP | axios (a single shared client; add) — **deferred to the final auth/API swap; UI-first uses a mock data source** |
| Data source (`UI-first`) | `mockDatabase.ts` — a backend-shaped, wire-faithful in-memory mock that stands in for `smarthub-api` behind the API-client seam |
| Forms | react-hook-form + zod (add) |
| Realtime | socket.io-client (add) |
| Toasts | sonner (add) |
| Misc | framer-motion (sparingly), tiptap, cmdk, isomorphic-dompurify, react-easy-crop, Sentry (optional) |

### What the target already ships

- Next + React + TS strict scaffold, root-level `app/ components/ lib/ hooks/`
- Tailwind v4 `globals.css` with shadcn base-vega tokens
- `cn()` in `lib/utils.ts`
- `theme-provider.tsx` (next-themes)
- `Button` component

---

## 3. The source (what we are porting)

Next 15 / React 19 / Tailwind v3 / Radix shadcn / TanStack Query 5 / Zustand 5
/ RHF + Zod / axios / socket.io / framer-motion / tiptap / Sentry. ~40k LOC,
28 modules under `src/modules/`, plus `src/app`, `components`, `configs`,
`hooks`, `lib`, `store`, `types`.

### Source module inventory (28)

auth, courses, learning (recordings/materials/modules), assignments,
assigned-modules, teaching (+attendance), dashboard, notifications,
conversations (inbox), messaging (AssignmentThread), calendar, activity,
search (⌘K), webinars, oreo (AI), referrals, payment-proofs, billing,
instructor-earnings, profile, siwes-profile, acceptance-letters, push,
internships, tech-scholarship, branding, help, + self-contained `check-in`
page.

### Source design language (reference only, NOT ported)

Primary = deep maroon `#430330`, accent = orange `#F29913`, zinc neutral
surfaces, `--radius: 0.75rem`. We keep the **new** preset instead.

---

## 4. What "porting" means here

We rebuild the **business logic, module structure, API contracts, screens and
navigation** on the new stack. Because the foundation layers diverge (Next
15→16, Tailwind v3→v4, Radix→Base UI, `src/*`→root), most files are
**re-authored**, not copied:

- **Port directly** (stack-agnostic): module `api/service + queries +
  normalise + config/endpoints + types`, state-store logic, business rules,
  real-time event handling, page composition.
- **Re-author via shadcn MCP**: every UI primitive and every screen is rebuilt
  from the new `base-vega` components using the current `globals.css` tokens.
- **Re-path**: `@/* → src/*` becomes `@/* → ./*` (root directories).

### The canonical module shape (port this pattern)

```
modules/<x>/
├── api/
│   ├── <x>.service.ts      # axios calls (verb-shaped) — only place touching the client
│   ├── <x>.queries.ts      # TanStack-query hooks (public surface)
│   └── normalise.ts        # API → UI shape mapping
├── components/             # <X>PageContent + supporting components
├── config/endpoints.ts     # endpoint path constants
└── types/
    ├── api.types.ts        # wire shapes
    └── index.ts            # UI shapes
```

### Shared infrastructure to port (before modules)

- `lib/utils.ts` → add `formatPrice`, `formatDate`, `formatDateTime`,
  `formatDateTimeFriendly`, `timeAgo`, `htmlToPlainText`
- `lib/constants/storage.ts`, `lib/constants/api.ts` (`LMS_PREFIX = "/lms"`)
- `lib/services/storage.service.ts`
- `lib/api/client.ts` + `types` (axios singleton, bearer token, single-flight
  401 refresh, auto-toasts, `getBlob`, `silent`, `ApiError`) — **built to the
  interface in Foundation; wired to the *mock* until the final auth/API swap**
- `lib/api/mock/` — `mockDatabase.ts` (wire-faithful records), `index.ts`
  (async query/mutation handlers), types mirroring the backend contract
- `lib/socket/socket-provider.tsx` + `useSocket`
- `lib/` misc: `cloudinary-download`, `image` (downscale), `mime-extension`,
  `module-progress`
- `store/slices/`: `authStore`, `roleModeStore`, `sidebarStore`, `uiStore`
- `configs/brand.ts`, `configs/nav.ts`
- `hooks/`: `use-page-param`, `use-notification-chime`, `use-title-notifier`
- `providers/`: `app-providers`, `query-provider`
- `types/content-link.ts`

---

## 5. New dependencies to add (via shadcn MCP + npm)

`zustand`, `@tanstack/react-query` (+ devtools), `axios`, `sonner`,
`react-hook-form`, `zod`, `@hookform/resolvers`, `framer-motion`,
`socket.io-client`, `cmdk`, `isomorphic-dompurify`, `react-easy-crop`,
`@tiptap/*`, and (optional) `@sentry/nextjs`.

All **UI primitives** come from the shadcn registry through the MCP — never
hand-roll a primitive that shadcn provides.

---

## 6. Route map to recreate (source → target)

**Auth** `(auth)`: login, forgot-password, reset-password/[token],
accept-invitation. Centered panel layout.

**App shell** `(app)`: auth-gated layout → `SideRail` (desktop) + `TopBar` +
`BottomNav` (mobile) + auth gate + `PaymentGate` + photo gate + PWA install
prompt + socket + message toast + ⌘K command palette listener.

**Routes** (each is a thin page delegating to a module `*PageContent`/client):
dashboard, courses (+/[slug], +/modules/[moduleSlug], +/assignments/[id]),
recordings, materials, assignments, assigned, teach (+ cohorts CRUD), calendar,
inbox, notifications, activity, webinars, oreo, help, profile (+ security),
billing (+/cohort/[scheduleId]), payments, internships (+/me/payment),
refer-and-earn, check-in. Plus root `/` → redirect `/dashboard`, `not-found`,
`global-error`, `manifest`, `robots`, `middleware` (robots header).

---

## 7. Delivery order — **UI-first against mock data, auth/API last**

> Each plan is written and confirmed with the user before executing. The
> ordering reflects the confirmed **UI-first** strategy: we build the whole
> product against a backend-shaped **`mockDatabase.ts`** first, then swap the
> data source for the real API + auth as the final step. This is *what/where/
> in-what-order*; the *how* (deep modules, the data-source seam) is in
> `ARCHITECTURE.md`.

1. **Foundation** — deps, shared infra (stores, utils, providers, constants,
   configs), design tokens verified, `cn` helpers. **+ mirror the backend
   contract as a local types source** and **`mockDatabase.ts`** (wire-faithful
   records + ids) behind an API-client seam, so every later screen treats mock
   data exactly like real API data.
2. **App shell & routes skeleton** — root layout, `(app)`/`(auth)` groups,
   middleware, manifest, 404, global-error, page stubs/redirects. (`(auth)`
   group exists but landing is a *later* concern — no real login yet.)
3. **Navigation chrome** — SideRail, TopBar, BottomNav (mobile menu), logo,
   user-menu, theme-toggle, role-switcher, ⌘K palette. Reads roles/mode from
   mock-seeded stores.
4. **Dashboard** — compose from the mock; stats strip, course progress,
   welcome, widgets.
5. **Courses + Learning** — courses list/detail, module page, recordings,
   materials, playback/preview (all DB-backed via the mock).
6. **Assignments** — list + detail + submission flow + grading (instructor).
7. **Calendar + Activity + Webinars**.
8. **Messaging + Inbox + Notifications** (realtime via the mock's event
   emitter / socket seam).
9. **Profile + Payment-proofs + Billing + Instructor-earnings + SIWES +
   Acceptance-letters + Referrals + Push**.
10. **Programs + AI + Help** — Internships, Tech-scholarship, Oreo, Help,
    Branding.
11. **Teaching (instructor CRUD + attendance)** — the largest module.
12. **Auth + API swap** — replace the mock data source with the real axios
    client / auth gate. Everything above stays identical because they consume
    the API-client seam; only the adapter behind it changes. **Auth is the
    final step, not an early one.**

Each plan file below fills in the exact steps, files, shadcn components, and
acceptance checks for its slice.

---

## 8. Non-negotiables / conventions

- **Design system**: the new `base-vega` preset + current `globals.css`
  tokens. Not re-themed to old brand. All UI via shadcn components.
- **TypeScript strict**; no `any`; Zod for runtime narrowing. Lint +
  `typecheck` + `build` must pass at each checkpoint (see
  `verification-before-completion`).
- **No code until the plan for that slice is confirmed.** Confirm scope with
  the user; never assume.
- **Every module owns its api layer** — components never call axios directly.
- **Endpoint paths are constants** in `config/endpoints.ts`.
- **API responses are normalised** to small UI shapes; components stay
  decoupled.
- Mobile-first styling; `rounded-2xl` cards; shadcn defaults for controls.
- Comments explain *why*, not *what*; no `any`; no emoji in code.

---

## 9. shadcn MCP usage

Configured in `opencode.json`:

```json
{
  "mcp": { "shadcn": { "type": "local", "command": ["npx", "-y", "shadcn@latest", "mcp"], "enabled": true } }
}
```

Use it to browse/search/install shadcn components for this project. Restart
opencode after editing config for changes to take effect.
