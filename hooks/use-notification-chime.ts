"use client";
import { useCallback } from "react";

/**
 * Plays a short two-tone chime via the Web Audio API — no binary asset.
 * Reuses ONE lazily-created AudioContext across calls (browsers cap the
 * number of concurrent contexts, so we never spin up a fresh one per
 * notification). Silently no-ops if AudioContext is unavailable or
 * blocked (e.g. before the user's first gesture).
 */
let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx) sharedCtx = new Ctx();
  return sharedCtx;
}

export function useNotificationChime() {
  return useCallback(() => {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      if (ctx.state === "suspended") void ctx.resume();
      const now = ctx.currentTime;
      const notes = [880, 1174.66]; // A5 -> D6, a soft rising ping
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = now + i * 0.12;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.15, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch {
      /* audio unavailable / blocked — ignore */
    }
  }, []);
}
