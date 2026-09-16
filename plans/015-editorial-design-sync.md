# PLAN 015 — Editorial Design Sync (from `smarthub-core-client`)

**Status:** In progress — slice 1 (Courses) shipped and live-verified;
remaining pages to follow incrementally per user direction
**Owner:** SmartHub design-system modernization (same track as Plan 014;
see `plans/DESIGN-SYSTEM.md` for the master context)
**Depends on:** ADR 0015 (brand colors restored). Supersedes nothing —
this sits *alongside* Plan 014's operator-tool chrome work, applying to
a different class of surface (see §4).

---

## 0. Why this doc exists

Every pass so far in this track (Courses, self-paced, Calendar) worked
*within* the LMS's existing shadcn `base-vega`/Base UI components: solid
fills instead of tints, a `CircularProgress` ring, `Badge` variant
adoption. That is real consistency work, but it never changed the
underlying visual language — same grid, same card shapes, same
`Inter`/`JetBrains Mono` type, same neutral-gray surfaces as the legacy
port. Reviewed live, it reads as "tidier legacy," not a new creative
direction.

The user pointed at `smarthub-core-client` — the recently-rebuilt public
marketing site — as the actual target aesthetic: **"adopt that UI design
system, all the colors, and editorial style... that's what we'd
eventually sync into this LMS."** This doc is the analysis of that
system and the outline for syncing it in. No code changes yet.

---

## 1. Source analysis — `smarthub-core-client`'s design system

Repo: `~/Documents/smarthub-projects/smarthub/smarthub-core-client`
(Next.js 15, React 19, Tailwind v3 config file, shadcn "default" style
on **Radix** primitives — not Base UI). Dev port 3001.

### 1.1 Color tokens (`src/app/globals.css`, `tailwind.config.ts`)

- `--primary: 316 91% 14%` — maroon `#430330` (same brand hue the LMS
  already has via ADR 0015).
- `--accent: 36 89% 51%` — orange `#F29913` (same as LMS).
- **The divergence: surfaces are warm, not neutral.**
  `--background: 36 33% 97%` (a warm paper cream) and matching warm
  `--muted`/`--secondary`/`--border` (all hue ~30-32, not gray-neutral).
  The LMS's surfaces are neutral OKLCH grays (`oklch(1 0 0)` bg,
  `oklch(0.967 0.001 286.375)` muted — hue is essentially achromatic).
  This warm tint is the single biggest reason the two products *feel*
  different even with identical brand hues.
- **`--deep` (`316 82% 11%`)** — a dedicated "brand slab" token, shared
  unchanged across light/dark, that backs full-bleed maroon sections via
  a scoped class (`.canvas-deep`, `globals.css:130-149`) that reassigns
  *every* token (`--background`, `--card`, `--muted`, `--primary` even
  flips to orange-leads-on-maroon) for its subtree. Any shadcn primitive
  dropped inside just works, no `dark:`-style overrides needed. This is
  the mechanism behind the marketing page's alternating light/dark
  section rhythm — the LMS has no equivalent token or pattern today.
- **Dark mode is a deliberate near-neutral-warm** (`30 7% 6%`), not a
  tinted-maroon dark mode — documented reasoning in `globals.css:66-78`:
  a maroon-tinted dark bg landed within 2x luminance of `--deep`, so the
  section-alternation rhythm vanished. Also: **orange leads over maroon
  in dark mode** (`--primary` becomes the orange value at `36 89% 51%`)
  because maroon has too little contrast on near-black. The LMS's dark
  mode currently just lifts maroon's lightness (`0.497` vs `0.263`) and
  keeps maroon as primary in both modes — a simpler, still-valid choice,
  but worth knowing the marketing site made a different call here.

### 1.2 Typography (`src/app/layout.tsx:2-29`, `tailwind.config.ts:65-75`)

- **Fraunces** (serif, variable axes `SOFT`/`WONK`/`opsz`) for display
  via `font-display` class → `--font-display`. **Manrope** (grotesque
  sans) for body → `--font-sans`, replacing the legacy site's Inter.
  Documented rationale (`layout.tsx:12-16`): *"The serif does the
  persuading; the grotesque does the reading."*
- Wonk/opsz are dialled in only at display sizes (`globals.css:169-177`,
  `.font-display { font-variation-settings: "SOFT" 0, "WONK" 1, "opsz"
  120; }`) so headlines get character without sub-headings going soft.
- A fluid, uncapped display scale (`tailwind.config.ts:69-75`):
  `display-sm` (28→44px), `display-md` (36→64px), `display-lg`
  (44→96px), all via `clamp()` with tight negative letter-spacing and
  line-height ≤1.08. The LMS has no display scale at all — its largest
  heading is a plain `text-2xl`.
- Micro-typography pattern used on *every* section: an uppercase eyebrow
  label, `text-xs font-semibold uppercase tracking-[0.2em] text-accent`,
  preceded by an 8px accent-colored horizontal rule (`<span className="h-px
  w-8 bg-accent" />`). See `hero.tsx:34-37`, `section.tsx:79-89`.

### 1.3 Layout & composition primitives

- **One `Section` + `SectionHeading` pair** (`components/ui/section.tsx`)
  is reused by every marketing section: `Section` handles the
  paper/deep canvas toggle + atmospherics; `SectionHeading` is the
  eyebrow + serif title + lede + optional right-aligned action, used
  identically everywhere. Comment at `section.tsx:55-59`: *"Consistency
  here is what stops nine independently-built sections reading as nine
  different websites."* This is the highest-leverage single primitive
  to port — more valuable than any individual visual effect.
- **Asymmetric grids over uniform ones.** The hero is a 7/5 column split
  with the media column offset by a negative bottom margin so it breaks
  the grid line (`hero.tsx:81`, `lg:-mb-16`). The course grid drops its
  middle column on large screens (`courses-showcase.tsx:74-76`,
  `index % 3 === 1 ? "lg:mt-10" : ""`) "so the grid reads as a
  composition rather than a spreadsheet."
- **Numbered lists with oversized serif index numbers instead of icon
  bullets**, hairline top-border dividers instead of boxed cards
  (`why-smarthub.tsx:68-101`): `font-display text-2xl text-muted-foreground`
  for "01", "02"..., `border-t border-foreground/10 py-8 first:border-t-0`
  for each row. This directly answers what a redesigned course-outline,
  self-paced lesson list, or FAQ list could look like instead of the
  current boxed-card treatment.
- **Sticky-rail + scrolling-content pairing** for argument+evidence
  layouts (`why-smarthub.tsx:20-66`): the claim stays pinned
  (`lg:sticky lg:top-28`) in a narrower column while supporting content
  scrolls past in a wider one.

### 1.4 The course card (`src/modules/courses/components/course-card.tsx`)

Directly relevant — the LMS has its own `CourseCard` for the exact same
concept. Notable details worth adopting even independent of the wider
editorial pivot:
- Whole card is a stretched `<Link>` overlay (`inset-0 z-10`), not just
  the title — comment at `course-card.tsx:22-26` calls out "a 300px tile
  whose only hit area is one line of text" as the #1 failure mode being
  fixed.
- Image gets a bottom gradient scrim (`from-foreground/75 via-foreground/15
  to-transparent`) so light-on-image labels stay legible without a
  separate solid bar.
- A colored category dot + label sits directly on the image over the
  scrim; format/kind badges float top-right as blurred pills.
- On hover: image scales 1.04x, title turns accent-colored, card lifts
  `-translate-y-1`, and a circular arrow affordance
  (`h-9 w-9 rounded-full border`) fills solid-accent with the arrow
  nudging up-right — one coherent hover story across four properties at
  once, not just a border-color change.

### 1.5 Motion

- `rise` keyframe (`tailwind.config.ts:94-97`): fade + `translateY(18px
  → 0)`, `cubic-bezier(0.16,1,0.3,1)`, staggered via inline
  `style={{ animationDelay: "Nms" }}` per list/grid index (index * 80-90ms
  is the recurring interval). This is the single motion device used
  everywhere on the marketing site — no per-component bespoke animation.
- Marquee ticker with edge-fade mask (`proof-strip.tsx:51`,
  `mask-image: linear-gradient(...)`) and a duplicated content run for a
  seamless loop — used for the "what we offer" strip under the hero.
- `grain` (SVG fractal-noise overlay, `mix-blend-mode: overlay`,
  `globals.css:193-201`) and `bloom` (two soft radial warm/maroon
  gradients, `globals.css:205-221`) atmospherics, applied only to
  `.canvas-deep` hero/CTA sections — this is what keeps a large flat
  maroon field from banding and reading as "a CSS color" rather than a
  designed surface.

---

## 2. Current LMS state (for contrast)

`app/globals.css`, `app/layout.tsx`:

- Tailwind v4 (`@theme inline`, no `tailwind.config.ts`), shadcn
  `base-vega` preset on **Base UI** primitives (`render` prop, not
  Radix's `asChild`), OKLCH color space throughout.
- Fonts: `Inter` (body) + `JetBrains Mono` (`--font-mono`) — and
  notably `html { @apply font-mono; }` (`globals.css:162-164`), meaning
  the *entire app's base font is monospace* today, not even Inter by
  default at the html level. This is a deliberate "dense operator tool"
  choice (see `plans/DESIGN-SYSTEM.md` §1: *"Inter is right for dense
  operator tools"* — echoed almost verbatim in core-client's own
  `layout.tsx:14` comment about why it moved away from Inter).
- Surfaces are neutral-gray OKLCH, not warm-tinted. No `--deep` token,
  no canvas-scoping mechanism, no grain/bloom utilities, no display type
  scale, no `rise`/stagger convention (there is a pre-existing
  `Stagger`/`StaggerItem` component per `DESIGN-SYSTEM.md` §3, but no
  shared entrance-keyframe token).
- Brand colors are already correct and already OKLCH-converted (ADR
  0015/0016) — this is the one piece that needs no work.
- Design philosophy on record (`plans/DESIGN-SYSTEM.md` §1) has been
  explicitly **operator-tool-modern**: grouped nav, solid active-state
  fills, `better-ui`/`emil-design-eng` motion discipline. This was the
  right fix for "generic shadcn-default," but it was never an editorial
  pivot — it's a different aesthetic goal than what core-client now has.

---

## 3. The actual decision this doc surfaces

**The LMS is a dense operational app (tables, forms, dashboards,
grading queues); `smarthub-core-client` is a spacious marketing page.**
A literal 1:1 sync — 96px serif headlines and full-bleed maroon slabs on
every screen — would hurt the surfaces that are genuinely data-dense
(assignment tables, the grading inbox, settings forms, the calendar
grid). Full-bleed grain/bloom atmospherics on every page would also just
be visual noise at that frequency.

The user's direction, confirmed against the "Editorial / bold" mockup
shown earlier this session, is about **overall visual language** — not
"start from zero" on layout/density (the earlier `AskUserQuestion`
picked the narrower option, not the broadest one). Read together, the
proposal below is: **adopt the tokens, fonts, and the small set of
composition patterns everywhere; reserve the loudest effects (grain,
bloom, 96px display type, full canvas-deep slabs) for the narrative
surfaces that already read like "a page," not the ones that read like
"a tool."**

### 3.1 Surfaces that read as narrative (apply editorial fully)

- Dashboard hero/welcome banner
- Course landing pages (cohort + self-paced) — hero, "about this
  programme," module list
- The lesson player's surrounding chrome (not the video itself)
- Certificates
- Empty states, onboarding/first-run moments
- Marketing-adjacent surfaces already in the app: Refer & earn, Tech
  Scholarship widget, the auth screens

### 3.2 Surfaces that stay operator-dense (tokens + type + motion only,
no display-scale headlines, no canvas-deep slabs)

- Sidebar/nav chrome (Plan 014's work stands)
- Data tables (grading queue, submissions, billing history)
- Forms (Profile/Settings, assignment submission)
- Calendar grid, Inbox, Activity feed

Every surface in both groups still gets: warm-paper tokens instead of
neutral gray, the real `--accent`-leads-in-dark-mode nuance if we want
it, the eyebrow-label micro-pattern, hairline-divider list rows where a
boxed card isn't earning its border, and the `rise`/stagger motion
convention. Only the loudest devices (serif display type at
`display-lg`, grain, bloom, full canvas-deep sections) are reserved for
group 3.1.

**This split is the main open question for the user to confirm or
override before any build work starts** (see §7).

---

## 4. Token & asset porting plan (concrete)

All conversions below use the same HSL→OKLCH method already used for
ADR 0015/0016 in this repo (validated against the existing `--primary`/
`--accent` values before computing new ones — they reproduce exactly).

| New token | Source (core-client HSL) | OKLCH (computed, light) | Purpose |
|---|---|---|---|
| `--background` (warm variant) | `36 33% 97%` | `oklch(0.979 0.005 78.298)` | Replaces neutral white page bg on editorial surfaces |
| `--foreground` (warm variant) | `316 40% 9%` | `oklch(0.196 0.039 337.724)` | Body text on warm bg |
| `--deep` (new token) | `316 82% 11%` | `oklch(0.224 0.084 341.024)` | Brand slab — dashboard hero, course hero, certificate bg |
| `--secondary` (warm variant) | `32 20% 92%` | `oklch(0.941 0.007 71.385)` | Warm secondary surface |
| `--muted` (warm variant) | `32 20% 93%` | `oklch(0.949 0.006 71.394)` | Warm muted surface |
| `--border` (warm variant) | `30 15% 84%` | `oklch(0.880 0.011 67.687)` | Warm hairline border |
| dark bg (warm-neutral) | `30 7% 6%` | `oklch(0.171 0.003 67.636)` | Dark-mode page bg on editorial surfaces |
| dark card | `30 6% 11%` | `oklch(0.228 0.004 67.618)` | Dark-mode card |
| dark border | `30 6% 19%` | `oklch(0.313 0.007 67.584)` | Dark-mode hairline |

Fonts: add **Fraunces** via `next/font/google` (`variable: "--font-display"`,
`axes: ["SOFT","WONK","opsz"]`, same as core-client). Keep `Inter` for
operator-dense surfaces; body text on editorial surfaces can stay Inter
or move to Manrope — **open question, §7**.

Mechanism to port: a `.canvas-deep`-equivalent scoped class (name TBD,
e.g. `.canvas-brand`) that reassigns tokens for its subtree exactly like
core-client's, so existing Base UI components dropped inside it adapt
for free. This needs to be re-verified against Base UI's own theming
(it reads CSS vars the same way Radix does, so this should port
directly, but needs a real check against one Base UI component before
relying on it everywhere).

---

## 5. Component/pattern porting list (mapped to LMS surfaces)

| Core-client pattern | Source | LMS target |
|---|---|---|
| `Section` / `SectionHeading` | `components/ui/section.tsx` | New shared primitive — reimplemented against Base UI/Tailwind v4, used by every editorial-group surface |
| Numbered list, serif index, hairline dividers | `why-smarthub.tsx:68-101` | Course outline (`course-outline.tsx`), self-paced `LessonList`, FAQ accordion replacement |
| Course card: scrim, stretched link, hover-fill arrow | `courses/components/course-card.tsx` | `modules/courses/components/CourseCard.tsx`, `modules/self-paced/components/SelfPacedCourseCard.tsx` — a strict upgrade over the ring-badge treatment shipped this session, not a conflict with it |
| Hero: asymmetric grid, eyebrow, stat strip | `home/components/sections/hero.tsx` | Dashboard welcome banner, course landing page hero |
| `rise` keyframe + stagger convention | `tailwind.config.ts:94-97` | Global addition to `app/globals.css`, adopted wherever `Stagger`/`StaggerItem` is already used |
| Marquee ticker | `sections/proof-strip.tsx` | Possible use: rotating achievement/announcement strip on dashboard (needs a real content case, not just because it exists) |
| Grain + bloom | `globals.css:193-221` | `.canvas-brand` surfaces only (§3.1) — dashboard hero, course hero, certificate |

---

## 6. Scope for a first slice

### Shipped (slice 1 — Courses, commit `0e4fcb3`)
- Token additions to `app/globals.css`: `.canvas-warm` / `.canvas-brand`
  scoped classes (warm-paper + `--deep` brand slab, OKLCH-converted),
  additive only — dense operator surfaces untouched.
- Fraunces added (`--font-display`) in `app/layout.tsx`, wired through
  `@theme inline` and the `font-display` utility.
- `rise` keyframe registered as `--animate-rise` (Tailwind v4 CSS-first,
  no `Section`/`SectionHeading` primitive needed yet — not used by this
  slice; still open for a later slice that needs marketing-style
  section composition rather than page-header + card-grid).
- `PageHeader` gained `variant="editorial"` (eyebrow + serif title),
  applied to both cohort and self-paced course browse pages.
- `CourseCard` / `SelfPacedCourseCard` rebuilt on the core-client
  course-card pattern (scrim, eyebrow label, hover-fill arrow).
- Course landing page hero, stats strip, About/Instructors headings,
  and the module-list numbering (serif index, no box) redesigned.
- Found and fixed along the way: the app's actual base font is
  JetBrains Mono at the `html` level (not Inter) — editorial surfaces
  now explicitly set `font-sans` for body copy; operator controls
  (filter dropdowns) intentionally keep the mono voice.

### Deliberately not done this slice
- Nav/sidebar chrome — Plan 014's operator-tool treatment stands.
- Any data table, form, or the calendar grid.
- Grain/bloom — not used anywhere yet; still an open call (§7.5).
- The `Section`/`SectionHeading` composer — no surface needed
  marketing-style section composition yet; build it when one does.
- Dashboard hero, self-paced lesson player chrome, certificates —
  next candidates per the user's "expand incrementally" direction.

### Out of scope (explicitly deferred)
- Nav/sidebar chrome — Plan 014's operator-tool treatment stands.
- Any data table, form, or the calendar grid.
- Grain/bloom on more than one proven surface until it's confirmed to
  not read as noisy in this app's actual density.
- Rewriting every page in one pass — this is a page-by-page track, same
  discipline as Plan 014 and the Courses/self-paced/Calendar work.

---

## 7. Open questions — confirm before this becomes buildable

1. **Font for body text on editorial surfaces**: keep `Inter` (LMS's
   existing body font, less disruptive) or adopt `Manrope` (exact
   core-client match, "the grotesque does the reading")? Operator-dense
   surfaces keep Inter either way.
2. **Does dark mode also flip accent-leads-over-maroon** like
   core-client, or does the LMS keep its current "lifted maroon stays
   primary in both modes" approach? These are genuinely different
   brand feelings in dark mode.
3. **Confirm the group 3.1 / 3.2 split in §3** — is dashboard hero +
   course pages + certificates + auth the right first boundary, or
   should something move between groups (e.g. should Profile — a form,
   but also somewhat personal/narrative — get any editorial treatment)?
4. **Which surface goes first?** Proposed: dashboard hero (highest
   visibility, currently plainest). Confirm or redirect.
5. Grain/bloom: try it once on the proposed first surface and get a
   real screenshot review before deciding whether it ships anywhere
   else, or decide now to skip it entirely as "too marketing-site" for
   an app people use daily?

---

## 8. Registry housekeeping

- Reserves **Plan 015** in `plans/DESIGN-SYSTEM.md` §6 (next available
  was 015 per that doc).
- Once direction is confirmed and a first slice actually ships, the
  token/font decisions here become **ADR 0018** (next available per the
  same registry) — not written yet, since nothing is decided or built.
