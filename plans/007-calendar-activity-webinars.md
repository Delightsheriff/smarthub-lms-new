# PLAN 007 — Calendar + Activity + Webinars

**Status:** Draft (awaiting confirmation)
**Owner:** SmartHub port
**Depends on:** 001 (mock seam + enum mirrors), 002 (routes), 003 (nav), 004 (dashboard mounts the widgets), 006 (assignments — `useUpcomingDeadlines` reused by the deadline panel)

---

## 1. Goal

Port the three **read-oriented** surfaces that cluster together: the student
**calendar** (month / week / day / agenda grids, course filter chips, event
detail dialog, dashboard calendar card + upcoming-deadlines panel), the
**activity** feed (the seeded user's sign-ins, submissions, payments…), and
the **webinars** list (upcoming `join` vs past `watch`, plus the dashboard
webinar widget). All three are **UI-first against the mock**: wire-faithful
calendar events, activity rows and webinars are seeded in
`mockDatabase.ts` (Foundation) and served through the same API-client seam, so
every screen treats mock data exactly like real API data. No write paths in
this slice — everything here is read + navigation.

## 2. Scope

### In scope

**Calendar module (`modules/calendar/`)**
- `types/index.ts` — wire shape + UI shape (exact types in §4) and the
  mirrors of `CALENDAR_EVENT_TYPE` / `SOURCE` / `SCOPE` enums.
- `api/` — `calendar.service.ts` (list by `{ from, to }` range),
  `normalise.ts` (`normaliseEvent` — wire → UI), `calendar.queries.ts`
  (`useStudentCalendar`, `useUpcomingEvents`).
- `config/endpoints.ts` — `CALENDAR_ENDPOINTS.LIST`.
- `components/` — `CalendarPageContent` (view state machine +
  URL-synced active view), `MonthGrid`, `WeekGrid`, `DayView` +
  agenda view (inside `CalendarPageContent`), `CourseFilterChips`,
  `EventDetailDialog`, `grid-utils.ts` (pure grid math),
  `DashboardCalendarCard` (compact month grid + selected-day row),
  `UpcomingDeadlinesPanel` (reuses assignments' `useUpcomingDeadlines`).
- Mock collection (Foundation): calendar events of **every type × scope**
  — auto `class-session` (scope `schedule`, `sourceRef` → ClassSession id),
  auto `assignment-due` (scope `assignment`, meta `courseName`/`moduleTitle`),
  manual `announcement` (scope `global`), `general`, `office-hours`,
  `material-reminder` — plus a **webinar-registration** calendar event
  pointing at a webinar link so the "webinar on the schedule" story is real.

**Activity module (`modules/activity/`)**
- `types/index.ts` — `ActivityActor`, `ActivityResource`, `ActivityEvent`.
- `api/` — `activity.service.ts` (`listMine` paged), `activity.queries.ts`
  (`useMyActivity`), `config/endpoints.ts` (`ACTIVITY_ENDPOINTS.ME`).
- `components/MyActivityPageContent.tsx` — group-by-day feed, derived
  action label + icon from `action` string, `?page=` pagination.
- Mock collection (Foundation): activity feed rows for the **seeded user**
  (auth login/logout, enrolment, submission submit/resubmit, payment,
  password change) with `resource` labels and staggered `createdAt` values.

**Webinars module (`modules/webinars/`)**
- `types/` — `api.types.ts` (`ApiWebinar`, `PaginatedWebinarsResponse`) +
  `index.ts` (`WebinarSummary`) — exact types in §4.
- `lib/webinar-status.ts` — pure status helpers (`webinarStatus`,
  `isJoinWindowOpen`, `WEBINAR_DURATION_MS`).
- `api/` — `normalise.ts` (joinLink/watchLink fallbacks), `webinars.service.ts`
  (`list` / `listPaginated`), `webinars.queries.ts` (`useWebinars` with
  overloads for `sort: "upcoming"` list vs `sort: "past"` page).
- `config/endpoints.ts` — `WEBINAR_ENDPOINTS.LIST`.
- `components/` — `WebinarsPageContent` (Upcoming/Past tabs,
  URL-synced `?tab=`), `WebinarCard` (join vs watch), `DashboardWebinarsWidget`
  (self-gates to null when no upcoming).
- Mock collection (Foundation): webinars **≥1 upcoming** (with `liveLink`,
  `reservationsOpen`), **≥1 past** (with `recordingLink`, no live link), plus
  a poster URL + speakers/tags.

**Routes + dashboard**
- Replace the Plan 002 stubs: `(app)/calendar/page.tsx`,
  `(app)/activity/page.tsx`, `(app)/webinars/page.tsx` each delegate to its
  module's `*PageContent`.
- Mount `DashboardCalendarCard` + `UpcomingDeadlinesPanel` (and the existing
  Plan 004 dashboard that consumes them) and `DashboardWebinarsWidget` on the
  dashboard.

### Out of scope (explicitly deferred)
- **Writes:** creating/editing/cancelling events, webinar reservations,
  attendance marking — everything in this slice is read + navigate.
- Any admin/past-webinar management surface (group links, analytics).
- Realtime activity streaming (the socket seam is Plan 008 territory).
- The assignments **module itself** — only `useUpcomingDeadlines` + its types
  are *reused* here from Plan 006; no deadline logic is re-implemented.
- Calendar time-grid overlap resolution beyond the source's v1 sibling-shift.

## 3. Source reference

- `smarthub-core-lms/src/modules/calendar/components/{
  CalendarPageContent,CourseFilterChips,DashboardCalendarCard,DayView,
  EventDetailDialog,MonthGrid,UpcomingDeadlinesPanel,WeekGrid,grid-utils}.tsx`
- `smarthub-core-lms/src/modules/calendar/{api/{calendar.service,calendar.queries,normalise}.ts,config/endpoints.ts,types/index.ts}`
- `smarthub-core-lms/src/modules/activity/{components/MyActivityPageContent.tsx,api/{activity.service,activity.queries}.ts,config/endpoints.ts,types/index.ts}`
- `smarthub-core-lms/src/modules/webinars/{components/{WebinarsPageContent,DashboardWebinarsWidget}.tsx,lib/webinar-status.ts,api/{normalise,webinars.service,webinars.queries}.ts,config/endpoints.ts,types/{api.types,index}.ts}`
- `smarthub-api/src/constants/index.ts` — authoritative `CALENDAR_EVENT_TYPE` /
  `CALENDAR_EVENT_SOURCE` / `CALENDAR_EVENT_SCOPE` literal sets.

> Behavior/contracts ported; design tokens, Radix and Tailwind-v3 components
> are **not** — every primitive is rebuilt from the `base-vega` preset.

## 4. Target files / structure

```
modules/
  calendar/
    api/
      calendar.service.ts       # list({ from, to }) through the client seam
      calendar.queries.ts       # useStudentCalendar, useUpcomingEvents
      normalise.ts              # normaliseEvent — wire → UI (+ TYPE_MAP)
    components/
      CalendarPageContent.tsx   # view state machine (day/week/month/agenda)
      MonthGrid.tsx             # 6×7 grid, ±7-day overhang cells, compact prop
      WeekGrid.tsx              # data-driven hour band, positioned blocks
      DayView.tsx               # single-day column (same vertical math)
      CourseFilterChips.tsx     # per-group pills, hidden-set toggling
      EventDetailDialog.tsx     # shared dialog for every event surface
      DashboardCalendarCard.tsx # compact month grid + selected-day row
      UpcomingDeadlinesPanel.tsx# reuses assignments useUpcomingDeadlines
      grid-utils.ts             # pure grid math (deep util)
    config/endpoints.ts
    types/
      index.ts                  # wire shape + UI shape + enum mirrors
  activity/
    api/
      activity.service.ts       # listMine({ page, pageSize }) → { data, meta }
      activity.queries.ts       # useMyActivity
    components/
      MyActivityPageContent.tsx # group-by-day feed + pagination
    config/endpoints.ts
    types/
      index.ts                  # Actor / Resource / Event
  webinars/
    api/
      webinars.service.ts       # list(sort) + listPaginated(sort, page)
      webinars.queries.ts       # useWebinars — upcoming list / past page overloads
      normalise.ts              # normaliseWebinar — join/watch fallbacks
    components/
      WebinarsPageContent.tsx   # Upcoming/Past tabs (?tab= in URL)
      DashboardWebinarsWidget.tsx
    lib/
      webinar-status.ts         # pure status + join-window helpers
    config/endpoints.ts
    types/
      api.types.ts
      index.ts
app/(app)/
  calendar/page.tsx             # thin delegate → CalendarPageContent
  activity/page.tsx             # thin delegate → MyActivityPageContent
  webinars/page.tsx             # thin delegate → WebinarsPageContent
lib/api/mock/mockDatabase.ts    # EXTEND (Foundation): calendar events, activity rows, webinars
```

### Exact types

**`calendar/types/index.ts`** — wire shape + UI + enum mirrors:

```ts
/** Mirrors smarthub-api constants — the calendar event taxonomy. */
export const CALENDAR_EVENT_TYPE = {
  CLASS_SESSION: "class-session",
  ASSIGNMENT_DUE: "assignment-due",
  MATERIAL_REMINDER: "material-reminder",
  OFFICE_HOURS: "office-hours",
  ANNOUNCEMENT: "announcement",
  GENERAL: "general",
} as const;

export const CALENDAR_EVENT_SOURCE = {
  MANUAL: "manual", // admin-authored, freely editable
  AUTO: "auto",     // denormalised from Schedule / AssignmentSchedule / Material
} as const;

export const CALENDAR_EVENT_SCOPE = {
  GLOBAL: "global",
  COURSE: "course",
  SCHEDULE: "schedule",
  MODULE: "module",
  ASSIGNMENT: "assignment",
} as const;

export interface ApiCalendarEvent {
  _id: string;
  type: string;
  source: "manual" | "auto";
  title: string;
  description?: string;
  link?: string;
  location?: string;
  start: string;
  end?: string;
  allDay: boolean;
  scope: "global" | "course" | "schedule" | "module" | "assignment";
  scopeId?: string;
  isCancelled: boolean;
  /** Back-pointer to the source row. For a `class-session` event,
   *  sourceRef.id is the ClassSession id — distinct from `_id` — the id
   *  the attendance routes expect. */
  sourceRef?: { model: string; id: string };
  /** Type-specific extras. For `assignment-due`: { courseName?, moduleTitle? }. */
  meta?: { courseName?: string; moduleTitle?: string } & Record<string, unknown>;
}

export interface CalendarEventUI {
  id: string;
  type: string;
  title: string;
  description?: string;
  link?: string;
  location?: string;
  start: Date;        // built from the API ISO string; wall-clock parts drive the grids
  end?: Date;
  allDay: boolean;
  typeLabel: string;  // TYPE_MAP label, e.g. "Class" / "Due"
  typeTone: "primary" | "accent" | "blue" | "amber" | "violet" | "muted";
  isCancelled: boolean;
  /** Timetable grouping key for filter chips.
   *  scope 'schedule' → scopeId is the CourseSchedule id, etc. */
  scope?: "global" | "course" | "schedule" | "module" | "assignment";
  scopeId?: string;
  /** For a `class-session` event, the ClassSession id (sourceRef.id). */
  sourceId?: string;
  courseName?: string;   // lifted from meta for assignment-due
  moduleTitle?: string;  // lifted from meta for assignment-due
}
```

**`activity/types/index.ts`:**

```ts
export interface ActivityActor {
  user?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface ActivityResource {
  type?: string;
  id?: string;
  label?: string;
}

export interface ActivityEvent {
  _id: string;
  actor: ActivityActor;
  action: string;
  resource?: ActivityResource;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}
```

**`webinars/types/api.types.ts`:**

```ts
/** Non-admin projection — groupLink, watchCount, isPublished, isDeleted,
 *  createdAt, updatedAt excluded. */
export interface ApiWebinar {
  _id: string;
  title: string;
  nameSlug: string;
  description: string;
  date: string;
  speakers: string[];
  tags: string[];
  /** @deprecated Legacy link field — prefer liveLink (upcoming) or recordingLink (past). */
  watchLink?: string;
  /** Zoom / Meet / Teams URL — where students join the live event. */
  liveLink?: string;
  /** YouTube / Drive / Vimeo URL — where the recording lives after the event. */
  recordingLink?: string;
  posterUrl: string;
  isAvailable: boolean;
  reservationsOpen: boolean;
  externalResources?: Array<{ title: string; description?: string; link: string }>;
}

export interface PaginatedWebinarsResponse {
  statusCode: number;
  message: string;
  success: boolean;
  data: ApiWebinar[];
  meta: { total: number; totalPages: number; currentPage: number; pageSize: number };
}
```

**`webinars/types/index.ts`:**

```ts
export interface WebinarSummary {
  id: string;
  title: string;
  slug: string;
  description?: string;
  date?: string;
  speakers: string[];
  posterUrl?: string;
  /** Best link to attend (upcoming) — liveLink || watchLink. */
  joinLink?: string;
  /** Best link to rewatch (past) — recordingLink || watchLink. */
  watchLink?: string;
  isAvailable: boolean;
}
```

## 5. shadcn components to use (via MCP)

- `card`, `button`, `badge` (webinar status / "Live now", event type pills),
  `dialog` (`EventDetailDialog`), `separator`, `skeleton` (grid + feed + card
  loading), `tabs` (webinars Upcoming/Past; calendar view toggle if a Tabs
  style beats hand-rolled toggle chips).
- **No calendar/grid primitive exists in the registry** — the month/week/day
  grids are **deliberately hand-composed from `div` grid cells** (matches the
  source rationale: no 30kb+ calendar lib fights the design tokens). Note this
  in review; it is the one hand-rolled area of the slice.
- Icons from `lucide` (calendar, chevrons, map-pin, video, mic, presentation,
  clipboard-list, activity, key/log-in/log-out/pencil/plus/trash for the feed).

## 6. Steps

1. **Extend the mock (Foundation's `mockDatabase.ts`)** — seed:
   - Calendar events per type/scope: auto `class-session` (scope `schedule`, a
     few across the current/next weeks incl. a cancelled one), auto
     `assignment-due` (scope `assignment`, `meta.courseName`/`moduleTitle`),
     manual `announcement` (global), `office-hours`, `general`, and one
     **webinar-registration** general event linking the upcoming webinar.
   - Activity rows for the seeded user across the last 30 days
     (`auth.login`, `auth.logout`, `enrolment.create`, `submission.submit` /
     `.resubmit`, `Payment.create`).
   - Webinars: ≥1 upcoming (`liveLink` set, `reservationsOpen: true`) and ≥1
     past (`recordingLink` set, `date` >2h back) with posters/speakers/tags.
2. **Calendar module** — types + enum mirrors → `grid-utils` (all pure
   functions) → `normalise.ts` (+ `TYPE_MAP`) → service → queries →
   components in dependency order (`MonthGrid`/`WeekGrid`/`DayView` →
   `CourseFilterChips` → `EventDetailDialog` → `CalendarPageContent` → the two
   dashboard surfaces).
3. **Activity module** — types → service → queries → `MyActivityPageContent`
   (label/icon derivation from `action`, group-by-day, `?page=` pagination).
4. **Webinars module** — `api.types` + UI types → `webinar-status` →
   `normalise` → service (+PaginatedWebinarsResponse contract) → queries
   (upcoming list / past page overloads, stable hook order) →
   `WebinarCard` → `WebinarsPageContent` → `DashboardWebinarsWidget`.
5. **Routes** — point the Plan 002 stubs at the three `*PageContent`
   components.
6. **Dashboard** — wire `DashboardCalendarCard` + `UpcomingDeadlinesPanel`
   beside the existing dashboard layout; mount `DashboardWebinarsWidget`.
7. Verify: `npm run typecheck`, `npm run lint`, dev-boot, then the
   acceptance behaviors in §7.

## 6.5 Architecture brief (see `ARCHITECTURE.md`)

1. **Deepen** — deletion-test each surface:
   - `grid-utils.ts` is the genuine deep module of the calendar slice: all the
     grid *math* (ISO-week bounds, data-driven hour band, event→px
     positioning, chip grouping keys) behind a small pure-function interface
     that `MonthGrid`/`WeekGrid`/`DayView` share. Keep views thin.
   - `webinar-status.ts` is the pure lexer for the webinars domain (status +
     join-window); components only render its output.
   - `normaliseEvent`/`normaliseWebinar` are the pure ports from wire to UI —
     the `type → { label, tone }` map and the join/watch fallbacks live there,
     not in components.
   - `UpcomingDeadlinesPanel` stays **deliberately shallow**: the deadline
     logic (`useUpcomingDeadlines` sort/filter) is owned by the assignments
     module (Plan 006) and reused, not re-implemented.

2. **Seams** — no *new* seam is warranted. These three are pure reads over the
   existing API-client / mock data-source seam from Foundation; each module
   adds only the service→queries→normalise pass-throughs. One adapter rule
   holds: no new abstraction beyond the established seam.

3. **Testability** — interfaces are pure functions wherever value is created:
   `grid-utils` and `webinar-status` are unit-testable with zero React.
   `normaliseEvent` is tested against **mock wire fixtures** (copies of the
   seeded `mockDatabase` calendar rows) asserting type→label/tone lift,
   `sourceRef.id → sourceId`, and `meta.courseName/moduleTitle` lifting.
   `normaliseWebinar` asserts fallback order (liveLink→watchLink for join,
   recordingLink→watchLink for watch).

4. **ADR** — record the **calendar event taxonomy mapping**: the mirrored
   `CALENDAR_EVENT_TYPE`/`SOURCE`/`SCOPE` enum sets are the single source of
   truth (from `smarthub-api`), the type→label/tone map lives in the
   calendar normaliser, and `scope`/`scopeId` is the timetable grouping key
   (`scopeId || scope || id`) shared by filter chips and the grids — so every
   surface derives badges + grouping from one taxonomy.

## 7. Acceptance checks

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run dev` boots; `/calendar`, `/activity`, `/webinars` render in the shell
- [ ] Calendar renders events **grouped by scope** (course/schedule chips) with
      working filter chips; tapping an event opens the detail dialog
- [ ] Month / week / day / agenda views all render from the same mock data;
      week + day respect the chip-hidden set and cancelled events are excluded
- [ ] `DashboardCalendarCard` + `UpcomingDeadlinesPanel` render beside the
      legacy-adjacent dashboard layout (calendar spans 2 cols, deadlines 1)
- [ ] Activity feed renders the seeded rows **grouped by day**, with derived
      labels/icons and working `?page=` pagination
- [ ] Webinars list distinguishes **upcoming (Join, `liveLink`) vs past
      (Watch, `recordingLink`)**; `DashboardWebinarsWidget` shows next 1–2
- [ ] Pure helpers covered: `grid-utils`, `webinar-status`, `normaliseEvent`
      (mock wire fixtures), `normaliseWebinar` (join/watch fallback order)
- [ ] ADR recorded for the calendar event taxonomy mapping

## 8. Open questions / to confirm

- **Event tone palette** — keep the source's `blue`/`amber`/`violet` tones on
  top of base-vega tokens, or restrict to `primary`/`accent`/`muted` +
  semantic colors? (Recommend keeping the distinct tones — type legibility.)
- **Week/day hour band** — confirm the data-driven band with an
  `08:00–20:00` fallback (source behavior) carries over unchanged.
- **Filter chips scope** — source shows chips only on Day/Week (not
  Month/Agenda); keep that, and keep chip state out of the URL?
- **Webinars upcoming tab** — source serves it unpaginated (single list) while
  Past is paginated; confirm that asymmetry is intended here too.
- **Activity pagination shape** — mock `meta` uses `totalItems`/`totalPages`;
  confirm the mock and the UI read those exact keys.