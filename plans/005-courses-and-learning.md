# PLAN 005 — Courses and Learning

**Status:** Draft (awaiting confirmation)
**Owner:** SmartHub port
**Depends on:** 001 Foundation (mock database, wire types, API-client seam, stores/utils/providers), 002 App shell & route stubs, 003 Navigation chrome. 004 Dashboard composes the same queries/widget this slice ships but is *not* a blocker.

---

## 1. Goal

Port the student learning surface end-to-end against the mock: **courses list → course detail → module page (content player) → playback/preview**, plus the two cross-course feeds (**recordings**, **materials**) and the standalone **assigned** surface. All data is read through the Foundation API-client seam from `mockDatabase.ts`. The slice also ports the **learning module's shared normalisation taproot** (`normaliseModuleContent` + friends) once, and reuses it from courses and assigned-modules — the locality win called out in `ARCHITECTURE.md` §"Known seams worth deepening".

## 2. Scope

### In scope
- **Learning module** (`modules/learning/`) — the **normalisation taproot** (`normaliseModuleContent`, `normaliseRecording`, `normaliseMaterial`, `normaliseAssignment`, `normalise*WithContext`, ref helpers), the content-lane UI types (`Recording`, `Material`, `Module`, `RecordingWithContext`, `MaterialWithContext`, …), `types/api.types.ts`, `api/` (service + queries), `config/endpoints.ts`, playback/preview primitives (`video-source`, `use-previewable-url`), and the content components (Recordings/Materials/Assignments sections, recording player dialog, material preview, module-page composition, recordings + materials feeds).
- **Courses module** (`modules/courses/`) — `Course`/`CourseInstructor` UI types, `api.types.ts`, `normaliseEnrolledCourse` + `buildBySlugResult`, service + queries (`useCourses`, `useCourseBySlug`, `useCourseModule`, `useDownloadCurriculum`), `config/endpoints.ts`, and `course-card`, `course-module-row`, `course-outline` + page compositions (list, detail, module page, `[slug]` layout with outline rail / mobile sheet).
- **Assigned-modules module** (`modules/assigned-modules/`) — `AssignedModule`/`AssignedAssignment` UI types, `api.types.ts`, `normaliseAssignedModule` (reusing the taproot's recording/material normalisers), service + queries, `AssignedModulesPageContent`, `DashboardAssignedModulesWidget` (composed by dashboard plan 004).
- **Route pages** (thin, delegating to `*PageContent`): `/courses`, `/courses/[slug]` (+ layout), `/courses/[slug]/modules/[moduleSlug]`, `/recordings`, `/materials`, `/assigned`.
- **Mock seed extension + handlers** — content-rich fixtures and the query/mutation handlers the screens read (see §2.2). Extends what Foundation seeded; does not re-architect the seam.
- **Shared rich-text rendering** — `rich-text` + `collapsible-rich-text` (sanitised admin-authored HTML from the TipTap editor). Not a shadcn primitive; ported as a small shared component.
- **Unit tests** — pure normaliser tests fed by wire fixtures, plus `video-source` classification tests.
- **ADR** — record the normalisation taproot decision.

### 2.1 Contract types this slice consumes

**WIRE (`api.types`, mirror of `smarthub-api` models + legacy LMS `modules/{courses,learning,assigned-modules}/types/api.types.ts`).** Modules re-export these through Foundation's single source of truth (`lib/api/types.ts`) rather than duplicating them:

- `ApiInstructor`, `ApiEnrolledCourseSchedule`, `ApiEnrolledCourseEnrollment`, `ApiEnrolledCourse`, `ApiEnrolledCourseDetails`, `ApiModule`
- `ApiRecording` (title, description, videoUrl, `links: ContentLink[]`, thumbnailUrl, duration, durationLabel, watched, isLockedForViewer, status)
- `ApiMaterial` (title, description, fileUrl, links, fileType, fileSize, category, tags)
- `ApiAssignment` (title, description, instructions, assignmentLink, links, type, priority, dueDate, totalPoints, allowLateSubmission, status, module, course)
- `ApiContentCourseRef`, `ApiContentModuleRef`, `ApiRecordingWithContext`, `ApiMaterialWithContext`
- `ApiAssignedModule`, `ApiAssignedAssignment`
- `ContentLink` / `toContentLinks` (Foundation: `types/content-link.ts`)

**UI (`index`, mirror of `modules/{courses,learning,assigned-modules}/types/index.ts`):**

- `Course` (id, slug, name, category, description, imageUrl, progress, durationLabel, startDate, `instructor{id?,name,title}`, `instructors?`, status, mode?, courseKind?), `CourseInstructor` (id, name, title, imageUrl?, bio?, whatsapp?: string|null)
- `Recording`, `Material`, `ContentCourseRef`, `ContentModuleRef`, `RecordingWithContext`, `MaterialWithContext`, `ModuleCohortStatus`
- `Module` (id, slug, courseId, order, title, summary, learningObjectives?, estimatedDuration?, cohortStatus?, cohortStartedAt?, cohortCompletedAt?, recordings, materials, `assignments: Assignment[]`)
- `Assignment` (content-lane UI type: id, title, instructions, description?, assignmentLink?, links, dueAt, allowLateSubmission, totalPoints, type, priority, status) — **defined in `modules/learning/types` this slice** because `normaliseAssignment` lives in the taproot and 006 lands later; Plan 006 re-exports it (see §8).
- `AssignedModule`, `AssignedAssignment` (id, title, description?, dueLabel?, type?)

### 2.2 Mock seed + handlers the screens read (extends Foundation `mockDatabase.ts`)

Seed fixtures must guarantee, beyond Foundation's base data:

- **≥2 enrolled courses**, each with ≥2 modules; **every module carries all three content lanes** (recordings + materials + assignments) so the module-page tabs never render empty in the demo path.
- Course A (e.g. slug `full-stack-development`) — mid-flight enrollment (`status: "in-progress"`, `progress` > 0); one module `cohortStatus: "in-progress"`, the rest `not-started`.
- Course B (e.g. slug `ui-ux-design`) — one completed enrollment (exercises the `status` mapping) to appear under the "Completed" filter.
- **Multi-part recording** (`links` ≥ 2 parts; Part 1 / Part 2) with a `videoUrl` mirroring `links[0].url`, per the source contract.
- **Locked recording** (`isLockedForViewer: true`, `videoUrl` withheld server-side) → renders the "Not available to you" state and must never open the player.
- **One `videoUrl` per provider shape** across seeds so `classifyVideoUrl` branches are all exercised: YouTube (`youtube.com`/`youtu.be`), Vimeo, Google Drive (`/file/d/<id>/view`), and a direct `.mp4` (Cloudinary `/video/upload/` or real file URL).
- Materials across providers: a Cloudinary **PDF** (incl. one extensionless Cloudinary URL to exercise `usePreviewableUrl` blob-wrap), a **multi-file** material (`links.length > 1`, row expands per-link preview/download), an **instructions-only guide** (no fileUrl, description-only), and one Drive-hosted material link.
- **≥2 standalone assigned modules**, at least one with all three lanes (its assignments read-only) + an instructor `note` + `learningObjectives`; one assigned module with a missing `titleSlug` to prove the slug→id URL fallback.
- One course module missing `titleSlug` (slug falls back to `_id`) to exercise the `useCourseModule` matcher.
- Inline HTML (TipTap-style) in a few `description`/`summary` fields so `rich-text`/`collapsible-rich-text` render real content.

Mock handlers to add/verify behind the seam (verb-shaped, mirroring `smarthub-api`):

- `GET /lms/courses` → `ApiEnrolledCourse[]`
- `GET /lms/courses/:slug` → `ApiEnrolledCourseDetails` — **embeds** each module's recordings/materials/assignments + aggregated `resources` counts (single round-trip; the outline + module page render off it, no per-module fan-out).
- `GET /lms/recordings/me` → `ApiRecordingWithContext[]`
- `GET /lms/materials/me` → `ApiMaterialWithContext[]`
- `PATCH /lms/recordings/:id/view` → flips `watched` on the matching enrolled-course record (player + outline tick re-render after query invalidation)
- `PATCH /lms/materials/:id/download` → records a download (fire-and-forget; no UI state)
- `GET /lms/modules/assigned` → `ApiAssignedModule[]`
- `GET /lms/courses/:slug/curriculum.pdf` → blob response (fidelity TBD in §8.2)

### Out of scope (explicitly deferred)
- **Assignments detail + submission flow** (`…/assignments/[id]`) — the route, outline link and module Assignments lane are wired here, but the page is filled by Plan 006; the 002 stub serves until then.
- **By-module content queries** (`recordings/module/:id`, `materials/module/:id`, `assignments/module/:id`) — instructor-facing; land with Teaching (Plan 011). The student surface reads the embedded detail payload only.
- **Instructor branch of `/courses`** (teaching cohorts cards, `useEffectiveMode` role switching) — Plan 011. This slice renders the student body; the nav label stays stable.
- **Course CRUD / cohort management / attendance** — Plan 011.
- Any real transport/auth work — Plan 012 (the seam is mock-backed all the way through).
- Re-theming, old design tokens, hand-rolled shadcn primitives, `any`.

## 3. Source reference

Paths under `~/Documents/smarthub/smarthub-core-lms/src/` (reference only — behavior/contracts, never the design system or Radix/Tailwind-v3 primitives):

- `modules/courses/types/{api.types,index}.ts`, `modules/courses/api/{courses.service,courses.queries,normalise}.ts`, `modules/courses/config/endpoints.ts`
- `modules/courses/components/{course-card,course-module-row,course-outline}.tsx`
- `modules/learning/types/{api.types,index}.ts`, `modules/learning/api/{learning.service,content.queries,normalise}.ts`, `modules/learning/config/endpoints.ts`
- `modules/learning/components/{module-section,recording-player-dialog,MaterialPreviewDialog}.tsx`
- `modules/learning/hooks/use-previewable-url.ts`, `modules/learning/utils/video-source.ts`
- `modules/assigned-modules/types/{api.types,index}.ts`, `modules/assigned-modules/api/{assigned-modules.service,assigned-modules.queries,normalise}.ts`, `modules/assigned-modules/config/endpoints.ts`
- `modules/assigned-modules/components/{AssignedModulesPageContent,DashboardAssignedModulesWidget}.tsx`
- `modules/assignments/types/index.ts` — only the `Assignment` UI shape (see §8.1)
- `types/content-link.ts`, `components/ui/{rich-text,collapsible-rich-text}.tsx`, `lib/cloudinary-download.ts` (`downloadFile`/`triggerBlobDownload` — Foundation)
- Route pages: `app/(app)/courses/{page,[slug]/page,[slug]/layout,[slug]/modules/[moduleSlug]/page}.tsx`, `app/(app)/recordings/page.tsx`, `app/(app)/materials/page.tsx`, `app/(app)/assigned/page.tsx`

Read `node_modules/next/dist/docs/` before writing route pages (Next 16 async-`params` + `use(params)` convention; `notFound()`).

## 4. Target files / structure

```
modules/learning/                       # owns the normalisation taproot
  api/learning.service.ts
  api/content.queries.ts                # useMyRecordings, useMyMaterials, view/download trackers
  api/normalise.ts                      # TAPROOT: normaliseRecording/Material/Assignment/ModuleContent/WithContext
  config/endpoints.ts
  types/api.types.ts                    # re-exports wire types from @/lib/api/types.ts + ContentLink
  types/index.ts                        # Recording, Material, ContentCourseRef, ContentModuleRef,
                                        # RecordingWithContext, MaterialWithContext, ModuleCohortStatus,
                                        # Module, Assignment (content-lane, see §8.1) + api re-exports
  utils/video-source.ts                 # classifyVideoUrl (provider classifier)
  hooks/use-previewable-url.ts          # Cloudinary blob-wrap seam
  components/module-section.tsx         # RecordingsSection / MaterialsSection / AssignmentsSection
  components/recording-player-dialog.tsx
  components/material-preview-dialog.tsx
  components/RecordingsPageContent.tsx
  components/MaterialsPageContent.tsx

modules/courses/                        # student course surface
  api/courses.service.ts
  api/courses.queries.ts                # useCourses, useCourseBySlug, useCourseModule, useDownloadCurriculum
  api/normalise.ts                      # normaliseEnrolledCourse + buildBySlugResult
  config/endpoints.ts
  types/api.types.ts                    # re-exports wire types from @/lib/api/types.ts
  types/index.ts                        # Course, CourseInstructor + wire re-exports
  components/course-card.tsx
  components/course-module-row.tsx
  components/course-outline.tsx
  components/CoursesPageContent.tsx     # student body only (instructor branch → 011)
  components/CourseDetailPageContent.tsx
  components/CourseModulePageContent.tsx  # module page (tabs+hash+prev/next); composes learning sections

modules/assigned-modules/
  api/assigned-modules.service.ts
  api/assigned-modules.queries.ts       # useAssignedModules
  api/normalise.ts                      # normaliseAssignedModule (reuses taproot recording/material norm.)
  config/endpoints.ts
  types/api.types.ts
  types/index.ts                        # AssignedModule, AssignedAssignment
  components/AssignedModulesPageContent.tsx
  components/dashboard-assigned-modules-widget.tsx

components/
  rich-text.tsx                         # sanitised HTML (non-shadcn port)
  collapsible-rich-text.tsx

app/(app)/(... routes)/
  courses/page.tsx                     → CoursesPageContent
  courses/[slug]/layout.tsx            → outline rail (lg+) + mobile Sheet drawer (CourseOutline)
  courses/[slug]/page.tsx              → CourseDetailPageContent
  courses/[slug]/modules/[moduleSlug]/page.tsx → CourseModulePageContent
  recordings/page.tsx                  → RecordingsPageContent
  materials/page.tsx                   → MaterialsPageContent
  assigned/page.tsx                    → AssignedModulesPageContent
  # …/assignments/[id] remains the 002 stub until Plan 006

lib/api/mock/mockDatabase.ts           (extend: content-rich seed from §2.2)
lib/api/mock/index.ts                  (register/handle the §2.2 endpoints)

tests (colocated, Vitest):
  modules/learning/api/normalise.test.ts
  modules/learning/utils/video-source.test.ts
  modules/courses/api/normalise.test.ts
  modules/assigned-modules/api/normalise.test.ts

docs/adr/adr-005-normalisation-taproot.md
```

> **Ownership note:** the module *page* glue (`CourseModulePageContent`) sits in `modules/courses` because it reads course-level data (`useCourseModule`, sibling prev/next) and delegates the three lanes to `modules/learning`'s sections — the same split the source had (page in the courses route, lanes in learning).

## 5. shadcn components to use (via MCP, `base-vega` preset)

- `card`, `button`, `badge`, `separator` — cards, CTAs, status pills, section dividers
- `sheet` — material-preview panel **and** the mobile course-outline drawer (shared `Sheet` surface, per the source's two-pane/mobile-sheet layout)
- `dialog` — recording player (centred modal player)
- `skeleton` — loading states on list/detail/feed pages
- `accordion` — course outline (module contents), course-detail module rows, module-page overview/objectives, assigned-module cards
- `tabs` — module content lanes (recordings / materials / assignments)
- `progress` — course-card + course-detail hero progress bars (not in the shorthand list; required by `course-card`/`course-detail`)
- `dropdown-menu` — status/mode/kind filters on the courses list (student body) (not in the shorthand list; required by `CoursesPageContent`)

> `rich-text`/`collapsible-rich-text` are **not** shadcn primitives (sanitised admin HTML); there is no registry item for them, so they port as small custom components.

## 6. Steps

1. **Extend the mock seed** (`mockDatabase.ts`): add the §2.2 fixtures — content-rich courses, multi-part + locked recordings, provider-varied video URLs, Cloudinary/Drive/multi-file/guides materials, missing-`titleSlug` modules, assigned modules, inline-HTML descriptions.
2. **Register the mock handlers** (`mock/index.ts`): course list/detail (with embedded modules + `resources`), `recordings/me`, `materials/me`, `modules/assigned`, the two PATCH trackers (view flips `watched`; download records), curriculum blob.
3. **Test harness**: add `vitest` dev dep + `test` script (confirm §8.3). No jsdom — this slice's tests are pure `node`.
4. **Learning module — types + normalise taproot**: port `types/api.types.ts` (re-export), `types/index.ts` (incl. `Module` + content-lane `Assignment`), and `api/normalise.ts` **once** — `normaliseModuleContent`, `normaliseRecording` (duration-label logic), `normaliseMaterial` (mime→type guess, Cloudinary-link detect), `normaliseAssignment`, `normalise{Recording,Material}WithContext` + ref helpers. Pure functions; no component imports.
5. **Learning module — endpoints/service/queries**: `config/endpoints.ts`, `learning.service.ts` (through the API seam), `content.queries.ts` (`useMyRecordings`, `useMyMaterials`, `useTrackRecordingView`, `useTrackMaterialDownload`; view mutation invalidates the course/module feed keys so the outline tick re-renders).
6. **Courses module — types + normalise**: `types/`, `normaliseEnrolledCourse` (instructor join, status synthesis) + `buildBySlugResult` (slugs the taproot with the detail payload's embedded arrays — thin composition over the deep module).
7. **Courses module — endpoints/service/queries**: `useCourses`, `useCourseBySlug`, `useCourseModule` (reuses the warmed `bySlug` cache and hydrates it on cold load), `useDownloadCurriculum`.
8. **Assigned-modules module**: types, `normaliseAssignedModule` (delegates recordings/materials to the taproot), endpoints, service, `useAssignedModules`.
9. **Playback/preview primitives**: `utils/video-source.ts` (`classifyVideoUrl` dispatch) and `hooks/use-previewable-url.ts` (Cloudinary blob-wrap with mime override; pass-through + loading + error fallback).
10. **Shared rich text**: `components/rich-text.tsx` + `collapsible-rich-text.tsx` (sanitise with `isomorphic-dompurify`, render with collapse at a `maxHeight`).
11. **Learning content components**: `module-section.tsx` (three lanes — locked recording guard, play-target semantics, multi-file + instructions-only expansion, per-link preview/download), `recording-player-dialog.tsx` (part pills, first-part default, view-track on play, 80% watch-complete ping, iframe/`<video>`/external fallback), `material-preview-dialog.tsx` (kind dispatch, Office-via-Google-Viewer, blob-wrapped in-app renders), plus the recordings/materials feed page contents.
12. **Courses components**: `course-card`, `course-module-row` (expandable, cohort-status badge, counts), `course-outline` (accordion TOC, active-by-URL + hash, `assignmentHref` builder), and the list/detail page contents (hero, pick-up CTA, stats, about, instructors, modules list, filters).
13. **Module page content**: tab lanes (empty tabs hidden), hash↔tab sync (`#recording-`/`#material-`/`#assignment-` + anchor scroll), prev/next module nav.
14. **Assigned module components**: `AssignedModulesPageContent` (accordion cards + read-only tasks, note, objectives) and `dashboard-assigned-modules-widget` (self-gating null when no assignments).
15. **Wire route pages** under `(app)` — thin client pages delegating to the page contents; `[slug]` layout with desktop outline rail + mobile `Sheet`. Verify the Next 16 async-`params` convention against the bundled docs before coding.
16. **Unit tests**: normaliser fixtures lifted from the mock (multi-part → `links.length > 1`; locked → `isLocked: true`; missing `titleSlug` → slug fallback; duration → label; with-context refs), plus `video-source` classification matrix.
17. **ADR**: `adr-005-normalisation-taproot.md` — learning owns the shared content normalisers; courses/assigned-modules/assignments consume; `Assignment` lane type lives in learning types (006 re-exports).
18. **Verify**: `npm run typecheck`, `npm run lint`, `vitest run`, dev-boot walkthrough (§7).

## 6.5 Architecture brief (see `ARCHITECTURE.md`)

1. **Deepen** — deletion-test the three normalise files. If `courses/api/normalise.ts` and `assigned-modules/api/normalise.ts` were deleted, does complexity concentrate in `learning/api/normalise.ts`, or just redistribute? It concentrates: duration-label formatting, mime→material-type guessing, Cloudinary-link detection, slug/id fallbacks, cohort-status pass-through, and with-context refs all live in the learning module, and courses + assigned-modules are thin mappings over it. **Port the taproot once** (`normaliseModuleContent`, `normaliseRecording`, `normaliseMaterial`, `normaliseAssignment`) and import it from both callers — do not re-implement per caller. The one genuine consumer into the taproot (`courses`'s `buildBySlugResult` feeding the detail payload's embedded arrays) stays in courses: knowing the *detail payload* shape is the courses module's job, and the module body is a single map call. This is the deep-module locality win `ARCHITECTURE.md` names.

2. **Seams** — two candidate seams:
   - `video-source.ts` (`classifyVideoUrl`) — genuinely multi-provider (youtube/vimeo/drive/mp4/external), but it's a *pure classifier*, one function, exercised directly by tests and shared by the player dialog and any future embed surface. Keep it a leaf util in `modules/learning/utils`, tested directly — an interface would add a layer with no second implementation.
   - `use-previewable-url` — one real variation (Cloudinary blob-wrap vs pass-through) plus a fallback. Per "one adapter = hypothetical seam; two = real one", keep it a hook, don't abstract. **Reuse what Foundation already built:** the data-source seam (`apiClient` mock-backed now, axios at Plan 012) is the real seam every query crosses — services are the only place that touches it.

3. **Testability** — normalisers are pure functions with public signatures, so the interface *is* the test surface: unit-test them with wire fixtures lifted straight from `mockDatabase.ts` (the fixtures double as the API contract). Port them exported (not private helpers) so queries stay thin (`map(normalise…)` in the `select`/`queryFn`), which is also what makes the Plan 012 data-source swap invisible. `video-source` gets a pure classification matrix. No jsdom needed.

4. **ADR** — yes: record the **normalisation taproot** decision (learning owns shared content normalisers; courses/assigned-modules/assignments consume; `Assignment` lane type lives in learning types until 006 re-exports it). This settles who you go to when a content shape changes.

## 7. Acceptance checks

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `vitest run` passes (normaliser + `video-source` tests; wire fixtures from the mock)
- [ ] `npm run dev` boots; **courses list → course detail → module page → player/preview is fully mock-driven** (no hardcoded fixtures inside page components; all reads through the seam)
- [ ] Courses list shows ≥2 courses with status/mode/kind filters; detail page renders hero/stat strip/instructors/modules (accordion rows + outline rail + mobile sheet)
- [ ] **Multi-part recording** renders part pills over the player, plays Part 1 by default, switches parts
- [ ] **Locked recording** renders locked in both the module lane and the recordings feed ("Not available to you" + lock icon); clicking it never opens the player; the mock withholds its `videoUrl`
- [ ] View tracking flips `watched` (mock mutation) → outline tick + recordings "Watched" filter update after invalidation; "Auto-marked complete at 80% playback" caption present
- [ ] Material preview renders a PDF in-app (blob-wrapped for the extensionless Cloudinary fixture); external/office kinds fall back to "Open in new tab"; multi-file material expands with per-link Preview/Download
- [ ] `/recordings` + `/materials` render course/module-context feeds with deep links back into the module page
- [ ] `/assigned` renders standalone modules with read-only tasks; `DashboardAssignedModulesWidget` self-gates (null when empty)
- [ ] Hash anchors (`#recording-`/`#material-`/`#assignment-`) switch the active module tab and scroll to the item; prev/next module nav works
- [ ] No `any`; component classes/styling from the new `base-vega` tokens (no maroon/orange, no Radix/Tailwind-v3 imports)
- [ ] ADR `adr-005-normalisation-taproot.md` recorded

## 8. Open questions / to confirm

1. **Content-lane `Assignment` type ownership.** `normaliseAssignment` lives in the learning taproot and `Module.assignments` is `Assignment[]`, but the source *defined* `Assignment` in the assignments module (006, which lands later). Recommend: define the `Assignment` UI shape in `modules/learning/types` this slice and have Plan 006 re-export it — avoids a forward cross-module import and keeps the taproot self-contained. Confirm vs. "leave a TODO seam and import from assignments after 006".
2. **Curriculum PDF fidelity in the mock.** `useDownloadCurriculum` hits `GET /lms/courses/:slug/curriculum.pdf` (blob). Options: (a) serve a static placeholder PDF asset with a proper filename (recommended), (b) generate a minimal PDF in the mock, (c) render the button but disable it until the real API. Confirm.
3. **Test harness.** The repo has no test runner yet. This slice introduces Vitest (pure node env, normaliser + classification tests only, no jsdom). Confirm adding `vitest` + a `test` script here rather than the Foundation slice.
4. **Fixture URL reachability for playback/preview.** Options: (a) seed real, publicly-reachable sample assets (YouTube/Vimeo/Drive ids, a public sample `.mp4`, a reachable sample PDF) so the player and preview genuinely render in dev (recommended — the mock then doubles as a demo dataset), or (b) placeholder URLs, accepting previews degrade to the "open externally" fallback offline. Confirm.