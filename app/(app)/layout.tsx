import { AppShell } from "@/components/layout/app-shell";

/**
 * `(app)` route group — the protected LMS shell. Server component: the
 * actual gating lives in `AppShell` (client), which reads the auth store
 * and redirects unauthenticated users to `/login`. Keeps the route tree
 * thin; the shell concentrates the guard + providers (see Plan 002 /
 * deeper-shell note).
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
