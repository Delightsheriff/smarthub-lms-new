/**
 * Brand constants used in places where Tailwind utilities can't reach
 * (favicon meta, theme-color, transitional inline styles in third-party
 * components). Tailwind classes still drive 99% of the look.
 *
 * Design note: colour lives in `app/globals.css` tokens. Per ADR 0015
 * the brand is SmartHub's own maroon (primary) and orange (accent).
 */
export const BRAND = {
  name: "SmartHub",
  /** SmartHub maroon (ADR 0015). Display surfaces use the CSS token;
   *  this is only for meta tags and the manifest. */
  primary: "#430330",
  url: "https://smart-hub.academy",
} as const;

/**
 * Shared content-column width (Tailwind class). Full width across
 * all viewports so the content sits close to the sidebar on large displays
 * (e.g. 16" screens) without dead margin space.
 */
export const CONTENT_MAX_WIDTH = "w-full max-w-full" as const;
