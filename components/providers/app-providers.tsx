"use client";
import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { MotionConfig } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
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
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
            <Toaster />
          </SocketProvider>
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
