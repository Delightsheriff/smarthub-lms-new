"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSocket } from "@/lib/socket/socket-provider";

/**
 * App-wide listener for `message:new` socket events.
 *
 * When the signed-in user is NOT on /inbox, raise a transient toast so a
 * message landing in the background is surfaced anywhere in the app. On
 * /inbox the open thread + badge are feedback enough — a toast would be
 * noise.
 *
 * In the UI-first phase the socket is the in-memory mock emitter from
 * Foundation, so this proves the wiring against `message:new` now. The
 * mock never fires it by itself today; the real socket + the inbox
 * unread badge both arrive with the messaging slice (Plan 008), when
 * this listener also refreshes the sidebar counter.
 */

interface MessageNewPayload {
  conversationId?: string;
  message?: {
    sender?: { firstName?: string; lastName?: string; email?: string } | string;
    content?: string;
  };
}

const senderName = (m: MessageNewPayload["message"]): string => {
  const s = m?.sender;
  if (!s || typeof s === "string") return "SmartHub";
  const full = [s.firstName, s.lastName].filter(Boolean).join(" ");
  return full || s.email || "SmartHub";
};

const preview = (m: MessageNewPayload["message"]): string => {
  const c = m?.content?.trim();
  if (!c) return "Tap to open your inbox.";
  return c.length > 80 ? c.slice(0, 77) + "…" : c;
};

export function MessageToastListener() {
  const socket = useSocket();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!socket) return;

    const handler = (payload: MessageNewPayload) => {
      if (pathname?.startsWith("/inbox")) return;
      const name = senderName(payload.message);
      toast.message(`New message from ${name}`, {
        description: preview(payload.message),
        action: {
          label: "Open",
          onClick: () => router.push("/inbox"),
        },
      });
    };

    socket.on("message:new", handler);
    return () => {
      socket.off("message:new", handler);
    };
  }, [socket, router, pathname]);

  return null;
}
