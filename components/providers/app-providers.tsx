"use client";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SocketProvider } from "@/lib/socket/socket-provider";

// Register the mock data-source routes and export the seam so module
// services (Plan 002+) resolve against the mock during the UI-first
// phase. Swap for the axios adapter at Plan 012.
import "@/lib/api";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SocketProvider>
          {children}
          <Toaster position="top-right" richColors closeButton theme="system" />
        </SocketProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
