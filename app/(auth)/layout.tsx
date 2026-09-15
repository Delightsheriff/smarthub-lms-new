import type { ReactNode } from "react";

/**
 * `(auth)` route group — public, centered panel layout. No gating: these
 * routes are reachable without a session.
 *
 * The ONE place the full-page background is painted. Page content
 * components (AuthCard/AuthColumn) own only the centered column —
 * never their own `min-h-screen`/background wrapper. A second nested
 * full-height box, confined to this layout's own max-width, used to
 * paint a visibly different background under the card than across the
 * rest of the page.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 py-12">
      {/* A soft brand glow, not a flat wash — the maroon does a little
          work here too instead of the page reading as plain gray. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_70%)]"
      />
      <div className="relative z-10 flex w-full flex-col items-center">
        {children}
      </div>
    </main>
  );
}
