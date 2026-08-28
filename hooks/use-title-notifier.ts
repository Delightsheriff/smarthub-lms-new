"use client";
import { useEffect, useRef } from "react";

/**
 * Flash the browser-tab title while there are unread notifications AND the
 * tab is in the background, so someone working in another tab notices a new
 * one landing. Alternates between the real page title and
 * "(N) New notification(s)" once a second; restores the real title the
 * moment the tab regains focus or the unread count hits zero.
 *
 * Deliberately only flashes when `document.hidden` — blinking the title of
 * the tab you're actively looking at is pure noise. Pass the live unread
 * count (the same number the bell badge shows).
 */
export function useTitleNotifier(unreadCount: number) {
  // The real title captured when a flash cycle starts, so we can put it
  // back. Kept in a ref so it survives re-renders without re-subscribing.
  const baseTitleRef = useRef<string>("");

  useEffect(() => {
    if (typeof document === "undefined") return;

    let interval: ReturnType<typeof setInterval> | null = null;
    let showingAlert = false;

    const restore = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (baseTitleRef.current) {
        document.title = baseTitleRef.current;
        baseTitleRef.current = "";
      }
      showingAlert = false;
    };

    const start = () => {
      if (interval || unreadCount <= 0) return;
      // Snapshot the current real title (strip any stale alert prefix in
      // case a previous cycle didn't restore cleanly).
      baseTitleRef.current = document.title.replace(
        /^\(\d+\)\s+New notification[s]?\s+·\s+/,
        ""
      );
      const base = baseTitleRef.current;
      const alert = `(${unreadCount}) New notification${
        unreadCount === 1 ? "" : "s"
      } · ${base}`;
      interval = setInterval(() => {
        document.title = showingAlert ? base : alert;
        showingAlert = !showingAlert;
      }, 1000);
    };

    const onVisibility = () => {
      if (document.hidden && unreadCount > 0) start();
      else restore();
    };

    if (unreadCount > 0 && document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      restore();
    };
  }, [unreadCount]);
}
