import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

/**
 * `(auth)` route group — public, centered panel layout. No gating: these
 * routes are reachable without a session.
 *
 * The ONE place the full-page background is painted. Page content
 * components (AuthCard/AuthColumn) own only the centered column —
 * never their own `min-h-screen`/background wrapper.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 py-12">
      {/* Top right theme switcher */}
      <div className="absolute top-4 right-4 z-20 md:top-6 md:right-6">
        <ThemeToggle />
      </div>

      {/* Atmospheric brand bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_70%)]"
      />
      <div className="relative z-10 flex w-full flex-col items-center">
        {children}
      </div>
    </main>
  );
}
