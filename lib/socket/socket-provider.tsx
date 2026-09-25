"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/store/slices/authStore";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = (): Socket | null => useContext(SocketContext);

let hasWarnedDev = false;

function resolveSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.AUTH_API_URL;
  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl);
      // In dev sandbox, /api-proxy proxies the REST API on port 5000
      if (parsed.pathname.includes("api-proxy")) {
        return `${parsed.protocol}//${parsed.hostname}:5000`;
      }
      return parsed.origin;
    } catch {
      // Ignore URL parse error
    }
  }

  if (process.env.NODE_ENV !== "production" && !hasWarnedDev) {
    hasWarnedDev = true;
    console.warn(
      "[SocketProvider] Neither NEXT_PUBLIC_SOCKET_URL nor a resolvable NEXT_PUBLIC_API_URL origin was found. Falling back to http://localhost:5000.",
    );
  }

  return "http://localhost:5000";
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    const socketUrl = resolveSocketUrl();
    const socketInstance = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: true,
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [token, isAuthenticated]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
