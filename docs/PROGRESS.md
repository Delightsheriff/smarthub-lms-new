# SmartHub LMS Port — Progress & Checklist

Living status doc for the port. Each plan has a checklist of its
deliverables; boxes are checked as they land. Use this to see everything
done so far and where we're at.

**Master context:** `plans/PORTING.md` · **Domain glossary:** `CONTEXT.md` ·
**Decisions:** `docs/adr/` · **Plan 002 outline:** `docs/PLAN-002-OUTLINE.md`

---

## Legend

- ✅ **Done** — built, verified (typecheck/lint/build), committed
- 🔨 **In progress** — being worked on right now
- ⬜ **Open / confirmed** — plan acknowledged by user, code not written
- 🚫 **Deferred** — deliberately postponed (with reason)

---

## Plan 001 — Foundation ✅

**Status: BUILT** — committed `e10adca` (2026-08)

| Deliverable | Status |
|---|---|
| Runtime + dev deps installed | ✅ |
| Contract mirror — `lib/api/constants.ts` (enums) | ✅ |
| Wire types — `lib/api/wire.types.ts` (string ids, nested sub-docs) | ✅ |
| Shared types — `lib/api/types.ts` (envelope + `ApiError`) | ✅ |
| Data-source seam — `lib/api/client.ts` (`get/post/put/patch/delete/getBlob`) | ✅ |
| Mock db — `lib/api/mock/mockDatabase.ts` (wire-faithful fixtures) | ✅ |
| Mock handlers — `lib/api/mock/router.ts` | ✅ |
| Barrel — `lib/api/index.ts` | ✅ |
| `lib/utils.ts` extended (`formatPrice`, `formatDate`, `timeAgo`, `htmlToPlainText`, …) | ✅ |
| `lib/constants/` — `api.ts`, `storage.ts` | ✅ |
| `lib/services/storage.service.ts` | ✅ |
| `lib/mime-extension.ts`, `lib/module-progress.ts`, `lib/image.ts`, `lib/cloudinary-download.ts` | ✅ |
| Socket seam — `lib/socket/socket-provider.tsx` (mock emitter) | ✅ |
| Stores — `authStore` (mock-seeded), `roleModeStore`, `sidebarStore`, `uiStore` | ✅ |
| `types/auth.ts` (`AuthUser`) | ✅ |
| Configs — `configs/brand.ts`, `configs/nav.ts` | ✅ |
| Hooks — `useEffectiveMode`, `usePageParam`, `useNotificationChime`, `useTitleNotifier` | ✅ |
| Providers — `QueryProvider`, `AppProviders`; root layout wired | ✅ |
| Animation folder — `FadeIn`, `Stagger`/`StaggerItem` | ✅ |
| `CONTEXT.md` glossary seeded | ✅ |
| `docs/adr/` — 5 foundation ADRs | ✅ |
| Verify: typecheck / lint / build / dev-boot | ✅ |
| **Commit (incremental lesson learned)** | ✅ |

---

## Plan 002 — App Shell & Route Skeleton ✅

**Status: BUILT** — incremental commits, 2026-08.
**Next-16 note:** `middleware.ts` is deprecated → we use `next.config.ts`
`headers()` for noindex (no `proxy.ts` yet; deferred to Plan 012 auth).

| Deliverable | Status |
|---|---|
| Root layout: Inter font, metadata (title template, noindex), viewport, `AppProviders` | ✅ `7860f65` |
| `next.config.ts` `headers()` → `X-Robots-Tag: noindex, nofollow` | ✅ `7860f65` |
| Root `app/page.tsx` → redirect `/dashboard` | ✅ `7860f65` |
| Global files: `manifest.ts`, `robots.ts`, `instrumentation.ts`, `not-found.tsx`, `global-error.tsx` (all Next-16-correct) | ✅ `8bb1cbb` |
| `(app)` route group + `layout.tsx` + `AppShell` (auth gating, redirect to `/login`) | ✅ `0be319d` |
| 20 `(app)` route stubs via `ComingSoon` (shadcn `Card`+`Skeleton`) | ✅ `bdf9f09` |
| shadcn `skeleton` + `card` primitives | ✅ `bdf9f09` |
| `(auth)` route group + centered panel layout + 4 stubs (`auth-placeholder`) | ✅ `90e5bac` |
| shadcn consistency pass (global-error button → shadcn `Button`) | ✅ `bdf9f09` |
| ADR 0006: `(app)`/`(auth)` split + gating layering; `headers` over `proxy` | ✅ `d0de220` |
| Verify: typecheck / lint / build (29 routes, webmanifest + robots generated) | ✅ |
| **Commit — INCREMENTAL (6 units, not one lump)** | ✅ |

---

## Plan 003 — Navigation Chrome ✅

**Status: BUILT** — incremental commits, 2026-08.

**Notes:** shadcn `sidebar`/`dropdown-menu`/`sheet`/`alert-dialog`/`avatar`
(built on `@base-ui/react` — **`render` prop, not `asChild`**). The nav *
data* is a pure seam (`configs/nav.ts`); toggling the dropdown's label had
to wrap `DropdownMenuLabel` in a `DropdownMenuGroup` for base-ui's
`Menu.Group` context (fix `a124f5b`). Nav-composition unit tests are
**deferred to the Plan 005 Vitest harness** (per plan; no test runner yet).

| Deliverable | Status |
|---|---|
| shadcn base-ui primitives: `avatar`, `badge`, `dropdown-menu`, `alert-dialog`, `sheet`, `input`, `separator`, `tooltip`, `sidebar` | ✅ commit 1 |
| Global `hooks/use-mobile.ts` rewritten (useSyncExternalStore; shadcn-gen violated lint) | ✅ commit 1 |
| `Logo` (legacy SVGs copied → `public/images/`), `ThemeToggle` (`use-mounted` sync-external-store) | ✅ commit 2 |
| `RoleSwitcher` (student/instructor, expanded vs collapsed) | ✅ commit 2 |
| `AppSidebar` — desktop rail (`Sidebar collapsible="icon"`, render-prop links, inbox badge `9+/99+`) | ✅ `677901c` |
| `useInboxUnreadCount` (sums `mockDatabase.conversations[].unreadCount[userId]`) | ✅ `677901c` |
| `BottomNav` — mobile pinned bar (4 items + More sheet, iOS safe-area) | ✅ `c2034d5` |
| `TopBar` + `UserMenu` (gated sign-out via `AlertDialog`) | ✅ commit 5 |
| Shell chrome in `AppShell` — controlled `SidebarProvider` (`open`/`onOpenChange` → `sidebarStore`) | ✅ `16f2ad9` |
| `MessageToastListener` (mock socket `message:new` → toast) + `CommandPaletteListener` (⌘K → `uiStore.searchOpen`, no dialog) | ✅ `16f2ad9` |
| Dropped `uiStore.sideNavCollapsed` duplicate (single source = `sidebarStore`) | ✅ `16f2ad9` |
| ADR 0007 (nav data/rendering seam) + README index | ✅ `db557d0` |
| Verify: typecheck / lint / **build (27 routes)** | ✅ |

---

## Plan 004 — Dashboard ✅

**Status: BUILT** — incremental commits, 2026-08.

**Notes:** shadcn base-ui primitives. Module cores → mock top-up → consuming
widgets → dashboard composition → ADR, per plan §6. Instructor teaching
dashboard deferred to Plan 011 (in-place `ComingSoon` placeholder). Calendar
`MonthGrid`/`EventDetailDialog` deferred to Plan 007 (lighter
`UpcomingDeadlinesPanel` this plan). Status nags = billing + referrals only
(acceptance-letter/internship/scholarship to Plans 009–010). No `modules/auth`
in target — `useAuthStore` + `useEffectiveMode()`.

| Deliverable | Status |
|---|---|
| 8 module cores — learning, courses, assignments, billing, referrals, webinars, assigned-modules, progress (`api` + `components` + `config` + `types`) | ✅ `01fb555` |
| Mock fixtures top-up (`assignment()` opts, referrals, banking, assigned-modules, progress-pulse) + router handlers (courses alias, payments summary, account/me, referrals, banking, assigned, progress-pulse, achievements, cohort-pulse) | ✅ `2cac8ae` |
| 6 consuming widgets (billing, referrals, webinars, assigned-modules, progress-pulse, upcoming-deadlines) — each self-gates to `null` | ✅ `67b7fa2` |
| Dashboard-local components — `StatsStrip`, `CourseProgressList` (assignments rollup via module query surface) | ✅ `47ca852` |
| `CourseCard` (rebuilt on base-vega; no `success` badge variant, mapped) | ✅ `47ca852` |
| `DashboardPage` + `StudentDashboardBody` — composition order + role branch; route wired | ✅ `47ca852` |
| ADR 0008 (dashboard is a composition point, not a module) + README index | ✅ `12b53fd` |
| Verify: typecheck / lint / **build (28 routes)** | ✅ |

---

## Plan 005 — Courses & Learning ✅

**Status: BUILT** — 6 incremental commits (`1df4743`…`8aa9a79`), 2026-08.

**Notes:** All four §8 open questions confirmed by user (Assignment stays in
`assignments` module; static placeholder curriculum PDF; Vitest added here;
real reachable sample assets). Plan 004's module cores already carried the
data layer — this plan delivered presentation + mock content + tests + ADR.
One normalisation taproot (`modules/learning/api/normalise.ts`) + one URL
classifier (`classifyVideoUrl`) serve every surface; no `success`/`accent`
badge variants exist, mapped to valid ones. Instructor courses branch
deferred to Plan 011 — student body only.

| Deliverable | Status |
|---|---|
| **Commit A** — Vitest harness (`vitest.config.ts`, `test` script) + content-rich mock seed (recording/material helpers w/ providers, multi-part, locked, drive, cloudinary; courses recs/mats; course_3 + mod_6/7/8; enriched assigned) + router handlers (course detail, my recordings/materials, view/download patches) + shadcn accordion+tabs | ✅ `1df4743` |
| **Commit B** — `classifyVideoUrl` (video/youtube/vimeo/drive/external), `use-previewable-url` (no effect setState), `RichText` + `CollapsibleRichText` (motion) | ✅ `63f81cf` |
| **Commit C** — `modules/learning` endpoints/service/`content.queries`, `recording-player-dialog`, `material-preview-dialog`, `module-section` (Recordings/Materials/Assignments), recordings/materials feeds | ✅ `c488c69` |
| **Commit D** — `course-module-row` (motion, valid badges), `course-outline`, `CoursesPageContent` (student body, dropdown filters), `CourseDetailPageContent`, `CourseModulePageContent` — all `render`-prop triggers, `text-emerald-600`, no `Accordion type=` prop | ✅ `1cdd64d` |
| **Commit E** — `AssignedModulesPageContent` + route wiring (courses list, `[slug]` detail + layout two-pane/Sheet, `[slug]/modules/[moduleSlug]`, recordings, materials, assigned) | ✅ `fb3b408` |
| **Commit F** — 4 Vitest test files (34 tests: normalisers + URL classifier) + ADR 0009 (shared normalisation taproot) | ✅ `8aa9a79` |
| Verify: typecheck / lint / **build (32 routes)** / 34 tests / dev-boot (6 routes 200) | ✅ |

---

## Future plans (deferred, in delivery order)

| Plan | Focus | Status |
|---|---|---|
| 006 | Assignments | 🚫 not started |
| 006 | Assignments | 🚫 not started |
| 007 | Calendar / activity / webinars | 🚫 not started |
| 008 | Messaging / inbox / notifications | 🚫 not started |
| 009 | Profile / payments / billing / SIWES / referrals | 🚫 not started |
| 010 | Programs & AI help (Oreo) | 🚫 not started |
| 011 | Teaching / instructor CRUD | 🚫 not started |
| 012 | Auth & API swap (final — real auth + axios adapter) | 🚫 not started |

---

## Cross-cutting conventions (from AGENTS.md)

- Work **one plan at a time**; a plan is confirmed by the user before code.
- **Never assume; confirm scope** — ask before starting a slice, flag ambiguities.
- **Commit incrementally** — small logical units, per deliverable, not one lump.
- Use **shadcn** primitives (via MCP); rebuild on `base-vega`; no old theme.
- Run `npm run typecheck` + `npm run lint` (+ build when feasible) before claiming done.
