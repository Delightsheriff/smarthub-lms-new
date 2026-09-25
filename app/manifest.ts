import type { MetadataRoute } from "next";
import { BRAND } from "@/configs/brand";

/** SmartHub's own maroon (ADR 0015): the installed app's title bar and splash. */
const BRAND_MAROON = BRAND.primary;

/**
 * Makes the LMS installable. On Android this is what turns the browser
 * into an "Add to home screen" offer and gives the installed app its
 * own icon and window; on iOS nothing is offered automatically — the
 * student has to use Share → Add to Home Screen, which is why
 * PushPermissionPrompt shows those instructions instead of a button
 * there.
 *
 * `display: "standalone"` matters beyond looks: iOS only delivers web
 * push to an app running standalone, and the prompt component keys off
 * that same display-mode to decide what to ask for.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — your learning hub`,
    short_name: BRAND.name,
    description:
      "Your courses, recordings, materials, and assignments — all in one place.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: BRAND_MAROON,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
