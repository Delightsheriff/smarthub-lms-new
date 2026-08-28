"use client";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { useAuthStore } from "@/store/slices/authStore";
import { useEffectiveMode } from "@/hooks/use-effective-mode";

/**
 * The `(app)` LMS shell.
 *
 * Owns the **gate**: reads `isAuthenticated` from `authStore` (the
 * interface — no HTTP mocking here) and redirects to `/login` when a
 * signed-in session is not present. In the UI-first phase the store is
 * seeded signed-in, so the shell renders; after `logout()` (or a cleared
 * store) it redirects to the (stub) login.
 *
 * Full navigation chrome (side rail, mobile nav, command palette) lands
 * in Plan 004. This layout only establishes the gated region + main
 * scroll container so the shell *concentrates* the guard rather than
 * each page owning it (deletion test: remove this and the gate reappears
 * per-page — so it must stay).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { mode } = useEffectiveMode();

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Minimal chrome placeholder — real top bar / rail in Plan 004. */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <span className="text-sm font-semibold tracking-tight">
          SmartHub
        </span>
        <span className="text-xs text-muted-foreground">
          {mode === "instructor" ? "Teaching" : "Learning"}
        </span>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
