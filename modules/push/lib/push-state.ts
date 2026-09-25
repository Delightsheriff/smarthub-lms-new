import type { PushConfig } from "../types";

/**
 * Where this device stands on web push.
 *
 * - `prompt`        — can be asked; nothing has been decided yet
 * - `granted`       — subscribed; nothing to offer
 * - `denied`        — the browser will never ask again for this origin
 * - `unsupported`   — no service worker / Push API at all
 * - `disabled`      — the server has no VAPID key configured
 * - `needs-install` — iOS Safari tab: push exists only once installed
 */
export type PushState =
  | "prompt"
  | "granted"
  | "denied"
  | "unsupported"
  | "disabled"
  | "needs-install";

export interface PushEnvironment {
  supported: boolean;
  ios: boolean;
  standalone: boolean;
  permission: NotificationPermission | null;
}

/**
 * The synchronous half of resolving a device's push state. Returns
 * `"check-subscription"` when permission is already granted, because
 * only an async look at the service worker can tell whether a live
 * subscription actually exists.
 */
export function classifyPushEnvironment(
  env: PushEnvironment,
  config: PushConfig | undefined,
): PushState | "check-subscription" {
  if (!env.supported) {
    // iOS supports push, but only once the app is on the Home Screen —
    // in a Safari tab the APIs are simply absent. Telling those users
    // "unsupported" would be wrong and unactionable.
    return env.ios && !env.standalone ? "needs-install" : "unsupported";
  }
  if (!config?.enabled || !config.publicKey) return "disabled";
  if (env.permission === "denied") return "denied";
  if (env.permission === "granted") return "check-subscription";
  return "prompt";
}

/** A dismissal of the push prompt is honoured for 30 days. */
export const PUSH_PROMPT_SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;

/** Whether a stored dismissal timestamp is still in effect at `now`. */
export function isPromptSnoozed(
  storedAt: string | null,
  now: number,
  snoozeMs: number = PUSH_PROMPT_SNOOZE_MS,
): boolean {
  const at = Number(storedAt ?? 0);
  return Number.isFinite(at) && at > 0 && now - at < snoozeMs;
}
