# SmartHub LMS

The learning platform for SmartHub Academy. It covers:

- **Students:** courses, recordings, materials, assignments, payments,
  internships, scholarships and referrals.
- **Instructors:** cohorts, grading, attendance, authoring and earnings.

This repo is a full rebuild of the legacy `smarthub-core-lms` frontend on a new
design system. The behaviour and API contracts come from the legacy app and
`smarthub-api`. The UI is new.

## Stack

- **Next.js 16** (App Router) and **React 19**, with the React Compiler lint
  rules
- **shadcn/ui** ("base-vega" preset) on **Base UI** primitives, and
  **Tailwind CSS v4**
- **TanStack Query** for server state, **Zustand** for client state
- **NextAuth (Auth.js v5)** for sessions, backed by `smarthub-api` credentials
- **socket.io** for live messages and notifications, plus web push through a
  service worker
- **Vitest** for tests

> This is not the Next.js from older tutorials. Before touching a Next API,
> read the guides in `node_modules/next/dist/docs/`.

## Getting started

Requirements: Node 22+, npm, and a running `smarthub-api` (on the `dev`
branch).

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
```

In development, the app proxies `/api-proxy/*` to the API at
`http://localhost:6001/api/v1`, so the browser only ever talks to port 3000.
The socket connects to the API directly (`lib/api/dev-origin.ts`).

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | Base URL the browser calls. In dev use `http://localhost:3000/api-proxy`; in production, the API's public URL. |
| `AUTH_API_URL` | yes | The API URL the server uses for sign-in, e.g. `http://localhost:6001/api/v1`. |
| `AUTH_SECRET` | yes | NextAuth signing secret (`npx auth secret`). |
| `AUTH_TRUST_HOST` | prod | Set to `true` behind a proxy or on Vercel. |
| `NEXT_PUBLIC_SOCKET_URL` | no | socket.io origin. Defaults to the API origin, or to `localhost:6001` in dev. |
| `NEXT_PUBLIC_API_BASE_URL` | no | Base for self-paced media URLs. |
| `NEXT_PUBLIC_PUBLIC_CLIENT_URL` | no | Public site origin used in share and referral links. |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint, including the React Compiler rules |
| `npm run test` / `npm run test:watch` | Vitest |

Before calling any change done, run all four checks:
`npm run typecheck && npm run lint && npm run test && npm run build`.

## Project layout

```
app/            routes — (auth) for sign-in flows, (app) for the signed-in shell
components/ui   shared primitives (shadcn/Base UI + editorial pieces: Ledger, IndexList, StatTile, …)
components/layout  app shell, sidebar, top bar, bottom nav
modules/<domain>   one folder per domain: api/ (service, queries, normalise),
                   components/, config/endpoints.ts, types/
lib/            API client, auth helpers, socket, utils
docs/adr        architecture decisions (0001–0018)
plans/DESIGN-SYSTEM.md  the living design-system reference
tests/          Vitest suites
```

Each domain module normalises the API's wire shapes (`_id` becomes `id`, and so
on) in its own `normalise.ts`. Components never read raw API rows. Every
endpoint path is checked against `smarthub-api`'s route files.

## Working on the UI

Read **`plans/DESIGN-SYSTEM.md`** first. It sets out:

- **Brand:** SmartHub maroon `#430330` and orange `#F29913` (ADR 0015), only
  ever through tokens, never raw Tailwind palette colours.
- **Editorial composition:** masthead headers, hero plus ledger, bento tiles,
  magazine-index lists.
- **The shared-primitive registry:** check it before adding a component.
- **Non-negotiables:** `Select` for filters, solid active states, not
  everything is a card, and motion needs a reason.

## Contributing notes

- Keep commits small and focused (`type(scope): summary`).
- `HANDOFF-NEXT.md` lists what's left before launch and the pitfalls learned so
  far. `AUDIT-FIX-PROMPTS.md` holds the original parity audit.
- The legacy app (`smarthub-core-lms`) and the API (`smarthub-api`) are
  read-only references for this repo.
