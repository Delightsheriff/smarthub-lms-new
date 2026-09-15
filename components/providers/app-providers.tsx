"use client";
import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SocketProvider } from "@/lib/socket/socket-provider";
import { AuthSessionBridge } from "./auth-session-bridge";

import "@/lib/api";

export function AppProviders({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <AuthSessionBridge />
      <ThemeProvider>
        <QueryProvider>
          <SocketProvider>
            {children}
            <Toaster position="top-right" richColors closeButton theme="system" />
          </SocketProvider>
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
