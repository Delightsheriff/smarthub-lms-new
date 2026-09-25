"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/store/slices/authStore";
import { DEV_API_ORIGIN } from "@/lib/api/dev-origin";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = (): Socket | null => useContext(SocketContext);

let hasWarnedDev = false;

/**
 * Socket origin: an explicit NEXT_PUBLIC_SOCKET_URL wins. Otherwise use
 * the API URL's origin — except the dev `/api-proxy` rewrite, which is
 * HTTP-only, so the socket goes straight to the API it proxies to.
 */
export function resolveSocketUrl(
  env: {
    NEXT_PUBLIC_SOCKET_URL?: string;
    NEXT_PUBLIC_API_URL?: string;
  } = {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
): string {
  if (env.NEXT_PUBLIC_SOCKET_URL) return env.NEXT_PUBLIC_SOCKET_URL;

  if (env.NEXT_PUBLIC_API_URL) {
    try {
      const parsed = new URL(env.NEXT_PUBLIC_API_URL);
      if (!parsed.pathname.startsWith("/api-proxy")) return parsed.origin;
    } catch {
      // Unparseable — fall through to the dev default.
    }
  }

  if (process.env.NODE_ENV !== "production" && !hasWarnedDev) {
    hasWarnedDev = true;
    console.warn(
      `[SocketProvider] No NEXT_PUBLIC_SOCKET_URL; using the dev API at ${DEV_API_ORIGIN}.`,
    );
  }
  return DEV_API_ORIGIN;
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // One socket per signed-in token; connect/disconnect is the effect's job.
  const socket = useMemo(
    () =>
      isAuthenticated && token
        ? io(resolveSocketUrl(), {
            auth: { token },
            withCredentials: true,
            transports: ["websocket"],
            autoConnect: false,
          })
        : null,
    [token, isAuthenticated],
  );

  useEffect(() => {
    if (!socket) return;
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
