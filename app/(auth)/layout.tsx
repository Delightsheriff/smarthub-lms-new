import type { ReactNode } from "react";

/**
 * `(auth)` route group — public, centered panel layout. No gating: these
 * routes are reachable without a session. Real authentication screens
 * land in the final Auth/API plan (Plan 012); these are stubs.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted/40 px-6 py-12">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
