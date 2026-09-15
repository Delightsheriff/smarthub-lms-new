# ADR 0015 — Restore SmartHub brand colors (supersedes ADR 0005)

- **Status:** Accepted
- **Date:** 2026-09
- **Supersedes:** [0005 — Keep the new `base-vega` design system](0005-keep-new-design-system.md)

## Context

ADR 0005 kept the shadcn `base-vega` preset's stock tokens verbatim and
explicitly refused to reintroduce the legacy maroon/orange identity,
treating that refusal as a feature ("maroon/orange usage is a red flag in
review"). In practice this meant `--primary` shipped as the preset's
magenta (`oklch(0.518 0.253 323.949)`, ≈ `#a800b7`) — a color with no
relationship to SmartHub — and `--accent` was simply aliased to
`--primary`, so the product had no independent accent color at all.

Direction from the user: the design-system modernization (concentric
radius, elevation, motion — see the `better-ui`/`emil-design-eng` skills
and the upcoming design-system plan docs) proceeds, but SmartHub's actual
brand identity — deep maroon `#430330` (primary) and orange spark
`#F29913` (accent) — is retained. The mandate is "rebuild the execution,
keep the brand," not "keep the execution, drop the brand." The look was
never the problem; the flat, under-elevated, motion-less execution was.

## Decision

`app/globals.css` now derives `--primary`/`--accent` (and everything that
follows from them: `--ring`, `--sidebar-primary`, `--sidebar-ring`) from
the exact legacy brand values, converted to OKLCH for this Tailwind v4 /
shadcn token set:

| Token | Light | Dark | Source |
|---|---|---|---|
| `--primary` / `--ring` / `--sidebar-primary` / `--sidebar-ring` | `oklch(0.263 0.108 342.162)` (`#430330` exactly) | `oklch(0.497 0.194 341.840)` (lifted, `#a51d81`) | `#430330`, HSL(316 91% 14%) |
| `--accent` | `oklch(0.754 0.162 67.889)` (`#f19813`) | `oklch(0.775 0.155 71.181)` (`#f3a32a`) | `#F29913`, HSL(36 89% 51%) |
| `--accent-foreground` | `oklch(0.141 0.005 285.823)` (= existing `--foreground`) | same | near-black, matches legacy's dark accent-foreground |

The dark-mode primary is a **lift**, not a re-hue: same brand hue
(≈342°), higher lightness, so the near-black light-mode maroon stays
legible against a dark background. This mirrors the legacy system's own
light→dark lift (HSL 14%L → 38%L) — the converted value round-trips
byte-for-byte to the legacy dark-mode hex (`#a51d81`), confirmed by
direct HSL→hex conversion.

`--accent` is now genuinely independent of `--primary` for the first time
in this repo — previously they were identical, so no surface could show
the two-tone maroon/orange identity at all.

Scope is deliberately narrow: only the brand-identity tokens above
changed. Neutral surfaces (`--background`, `--card`, `--secondary`,
`--muted`, `--border`), status colors (`--destructive`, `--warning`,
`--success`), chart colors, and `--radius` are untouched — they were
already reasonable and are not brand-identity. Notably, the legacy
`--destructive`/`--success`/`--warning` values were computed and found to
fail WCAG AA against white foreground text (contrast ratios 2.05–3.60,
need ≥4.5) — an existing accessibility bug in the legacy system. This repo
keeps its own already-accessible status tokens rather than reintroducing
that bug.

## Consequences

- **Positive:** the product is visibly SmartHub again — the exact brand
  hex values, not an approximation — while every other modernization
  (elevation, radius, motion, layout) proceeds independently on top of
  correct brand colors instead of a placeholder preset.
- **Positive:** `--accent` finally does real work; two-tone maroon/orange
  surfaces (badges, highlights, "success but not sombre" moments per the
  legacy comment) are possible again.
- **Positive:** both themes were designed with equal care from the same
  source values — dark mode is not an afterthought bolted onto light-only
  tokens.
- **Negative / watch-list:** any component that assumed `--accent ===
  --primary` (there may be a few, since that was true until now) needs a
  visual pass — they will now render two different colors where they
  used to coincidentally match.
- **Follow-up:** enable `@shadcn/lint`'s `no-raw-colors` rule (plugin is
  registered, rule not yet on) to catch any hardcoded raw Tailwind
  palette classes that should route through these tokens instead.
