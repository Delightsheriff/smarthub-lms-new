"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Socket } from "socket.io-client";

/**
 * Socket seam for the authenticated LMS shell.
 *
 * During the UI-first/mock phase there is no real socket.io server, so
 * this provider exposes a lightweight in-memory mock `Socket`
 * (EventEmitter shaped) that components can `.on(...)` / `.emit(...)`
 * against. It mirrors the surface the real adapter will use at Plan 012 —
 * consumers guard for `null` the same way regardless of phase.
 *
 * The live `socket.io` connection (with the bearer-token handshake and
 * reconnect re-auth) lands with the real API at Plan 012.
 */

interface MockSocketLike {
  on: (event: string, fn: (data?: unknown) => void) => unknown;
  off: (event: string, fn: (data?: unknown) => void) => unknown;
  emit: (event: string, data?: unknown) => unknown;
  disconnect: () => void;
}

function createMockSocket(): Socket {
  const listeners = new Map<string, Array<(data?: unknown) => void>>();
  const mock: MockSocketLike = {
    on: (event, fn) => {
      const arr = listeners.get(event) ?? [];
      arr.push(fn);
      listeners.set(event, arr);
      return mock;
    },
    off: (event, fn) => {
      const arr = listeners.get(event);
      if (arr) listeners.set(event, arr.filter((f) => f !== fn));
      return mock;
    },
    emit: (event, data) => {
      (listeners.get(event) ?? []).forEach((fn) => fn(data));
      return mock;
    },
    disconnect: () => listeners.clear(),
  };
  return mock as unknown as Socket;
}

const SocketContext = createContext<Socket | null>(null);

/** Live socket (or mock emitter in the UI-first phase), or `null` while
 *  connecting / unconfigured. Consumers MUST guard for null before
 *  emitting. */
export const useSocket = (): Socket | null => useContext(SocketContext);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket] = useState<Socket | null>(() => createMockSocket());

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
