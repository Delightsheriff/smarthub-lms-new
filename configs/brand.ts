/**
 * Brand constants used in places where Tailwind utilities can't reach
 * (favicon meta, theme-color, transitional inline styles in third-party
 * components). Tailwind classes still drive 99% of the look.
 *
 * Design note: colour lives in `app/globals.css` base-vega tokens (the
 * primary accent is the magenta `--primary`). We intentionally do NOT
 * carry the old maroon/orange brand over — the new design system is the
 * source of truth.
 */
export const BRAND = {
  name: "SmartHub",
  /** Derived from the base-vega `--primary` token. Display surfaces
   *  should use the CSS token; this is only for meta tags. */
  primary: "#d52b74",
  url: "https://smart-hub.academy",
} as const;

/**
 * Shared content-column width (Tailwind class). The top bar and the
 * `(app)` main column both center on this so chrome actions and page
 * content sit on the same vertical edges. Change it in ONE place.
 */
export const CONTENT_MAX_WIDTH = "max-w-6xl" as const;
