# Plan 002 — App Shell & Routes Skeleton: Outline

Load-bearing outline for the next slice. Grounded in `plans/002-app-shell-routes.md`
**but corrected to current Next.js 16 practices** (verified against
`node_modules/next/dist/docs/`). Goal: recreate the routing skeleton + app
shell so every future module has a home — **route stubs only, no real
screens**. UI-first: the shell mounts against the seeded mock session.

> **Rule applied here:** this is a **new system**, not a blind port. Where the
> legacy repo used a `middleware.ts` convention that Next 16 has replaced, we
> use the current one.

---

## 0. Next 16 corrections (from the bundled docs)

| Legacy habit | Next 16 practice | Source |
|---|---|---|
| `middleware.ts` | Renamed to **`proxy.ts`** (v16.0.0). Only **one** `proxy.ts` per project allowed. Proxy is described as a **last resort**; prefer config for simple header/redirect needs. | `03-file-conventions/proxy.md`, `01-getting-started/16-proxy.md` |
| Set `X-Robots-Tag: noindex` via middleware | Set it via **`next.config.ts` `headers()`** — idiomatic, no proxy needed | `05-config/01-next-config-js/headers.md` |
| `instrumentation.ts` | File convention: optional `register()` ran once per server instance; optional `onRequestError` for server error reporting | `03-file-conventions/instrumentation.md` |
| `global-error.tsx` | Must render its **own `<html>`/`<body>`** (outside root layout) | `03-file-conventions/error.md` |
| `manifest.ts`, `robots.ts` | **Metadata file conventions**, co-located in the route tree | `01-metadata/manifest.md`, `.../robots.md` |
| Route groups `(app)`/`(auth)` | Still valid; a route group's folder is excluded from the URL path | `03-file-conventions/route-groups.md` |

---

## 1. The two route groups

Next.js route groups shape the shell without affecting URLs:

- **`(app)`** — the protected LMS shell = `authStore`-gated layout + a main
  content region. Future module screens live here.
- **`(auth)`** — the centered public panel (login etc.). **Stubs only now**;
  real auth flow is the final plan (auth-last).

Both need a `layout.tsx`. Gating reads `isAuthenticated` from `authStore`
(the store is the interface — no HTTP mocking in the layout).

---

## 2. File-by-file

### Root level
- **`app/layout.tsx`** — root layout. Font (Inter/system), metadata title
  template `"%s · SmartHub"`, `robots noindex` via the `robots` metadata
  export (and/or `next.config.ts` header), viewport (theme-color,
  pinch-zoom), wrap children in `AppProviders` (built in 001).
- **`next.config.ts`** — add `X-Robots-Tag: noindex` via **`headers()`**
  (not a `middleware`/`proxy` file). This is the non-port, current practice.
- **`app/page.tsx`** — redirect `/` → `/dashboard` (via `redirect()`).
- **`app/not-found.tsx`** — 404 page in the new design system.
- **`app/global-error.tsx`** — error boundary with its own `<html><body>`.
- **`app/manifest.ts`** — web app manifest metadata convention; brand
  "SmartHub", start URL `/dashboard`.
- **`app/robots.ts`** — robots metadata convention.
- **`app/instrumentation.ts`** — optional `register()` hook (no-op for now,
  or defer; **not** an auth surface).
- **`proxy.ts`** — **DEFERRED / NOT CREATED in 002.** Auth (the reason to
  add it) lands in Plan 012; Next allows one `proxy.ts` and recommends it as
  a last resort. We avoid shipping an empty one.

### `(app)/`
- **`layout.tsx`** — the shell. Reads mock-seeded session from `authStore`;
  if not authenticated → redirect to `/login` (stub). Renders minimal chrome +
  `<main>` content region. Full nav chrome is **Plan 004**, so this layout is
  deliberately thin but *concentrates* the gating + providers (deletion test:
  the shell must own the guard, not each page).

### `(app)/<route>/page.tsx` — page stubs
Each renders a "Coming soon" placeholder within the shell using shadcn
`skeleton` (and maybe `card`). List:

`dashboard` · `courses` · `recordings` · `materials` · `assignments` · `assigned`
· `teach` · `calendar` · `inbox` · `notifications` · `activity` · `webinars` ·
`oreo` · `help` · `profile` · `billing` · `payments` · `internships` ·
`refer-and-earn` · `check-in`

### `(auth)/`
- **`layout.tsx`** — centered panel layout (no shell).
- **Stubs:** `login` · `forgot-password` · `reset-password/[token]` ·
  `accept-invitation`

---

## 3. Commit plan — INCREMENTAL

Do **not** lump into one commit. Logical units (each commitable alone,
each typecheck + lint clean):

1. **Root layout + metadata/viewport/providers** (`layout.tsx`)
2. **`next.config.ts` `headers()` noindex** + root `/` → `/dashboard` redirect
3. **Global files** (`manifest.ts`, `robots.ts`, `instrumentation.ts`,
   `not-found.tsx`, `global-error.tsx`)
4. **`(app)` shell layout + gating**
5. **`(app)` route stubs** (skeleton placeholders)
6. **`(auth)` layout + stubs**
7. **ADR** for the `(app)`/`(auth)` split + gating layering (+ decision to use
   `next.config.ts` headers over `proxy.ts`)

---

## 4. Docs to read before wiring (already checked for this outline)

- `03-file-conventions/proxy.md` — confirms `proxy.ts` + last-resort guidance
- `01-getting-started/16-proxy.md` — use-cases + single-file rule
- `03-file-conventions/route-groups.md` — group semantics
- `03-file-conventions/instrumentation.md` — register/onRequestError
- `05-config/01-next-config-js/headers.md` — for the noindex header
- `01-metadata/manifest.md`, `01-metadata/robots.md` — metadata conventions

---

## 5. Answer these before I start wiring

1. **Route list** — confirm the stub list in §2 matches what you want (plan
   says we can prune later).
2. **`proxy.ts`** — agree we **skip it in 002** (auth/API go last, single-file
   constraint, last-resort guidance)? The `noindex` header is handled by
   `next.config.ts` headers.
3. **`instrumentation.ts`** — include a no-op `register()` now, or defer?
4. **`(app)` gating in mock phase** — always render the seeded shell, redirect
   to login only after `logout()`/cleared state?
5. **Fonts** — keep current Geist/JetBrains, or switch to Inter per the plan
   note? (Minor; affects root `layout.tsx`.)

I'll wait on your instructions before touching code.
