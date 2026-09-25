"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pushService } from "./push.service";
import { STALE_TIME } from "@/lib/query-config";
import {
  dropLocalSubscription,
  getExistingSubscription,
  hasStaleVapidKey,
  isIOS,
  isPushSupported,
  isStandalone,
  requestAndSubscribe,
  resubscribeWithCurrentKey,
} from "../lib/browser-push";
import { classifyPushEnvironment, type PushState } from "../lib/push-state";
import type { NotificationPrefs, PushConfig } from "../types";

export const PUSH_QUERY_KEYS = {
  prefs: ["push", "prefs"] as const,
  config: ["push", "config"] as const,
  device: (publicKey: string | null) => ["push", "device", publicKey] as const,
} as const;

export function useNotificationPrefs() {
  return useQuery({
    queryKey: PUSH_QUERY_KEYS.prefs,
    queryFn: () => pushService.getPrefs(),
    staleTime: STALE_TIME.SLOW,
  });
}

export function useUpdateNotificationPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<NotificationPrefs>) => pushService.updatePrefs(payload),
    onSuccess: (updated) => {
      qc.setQueryData(PUSH_QUERY_KEYS.prefs, updated);
    },
  });
}

/**
 * The server's VAPID public key. Cached hard — it changes roughly
 * never, and re-fetching it on every mount would add a request to every
 * page load for no benefit.
 */
export function usePushConfig() {
  return useQuery({
    queryKey: PUSH_QUERY_KEYS.config,
    queryFn: () => pushService.config(),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

/**
 * Resolve this device's push state. Runs only in the browser (a query
 * never fetches during SSR), which matters: every check here touches
 * `window`/`navigator`.
 */
async function resolveDeviceState(config: PushConfig | undefined): Promise<PushState> {
  const supported = isPushSupported();
  const initial = classifyPushEnvironment(
    {
      supported,
      ios: isIOS(),
      standalone: isStandalone(),
      permission: supported ? Notification.permission : null,
    },
    config,
  );
  if (initial !== "check-subscription") return initial;

  const publicKey = config?.publicKey;
  if (publicKey && (await hasStaleVapidKey(publicKey))) {
    // Self-heal after a VAPID key rotation. A subscription created
    // against the old key looks healthy here, but the push service
    // rejects our JWT with a 403 and the user silently receives
    // nothing. Swapping it needs no gesture and shows no prompt.
    try {
      const rotated = await resubscribeWithCurrentKey(publicKey);
      if (rotated) {
        if (rotated.oldEndpoint) {
          await pushService.unsubscribe(rotated.oldEndpoint).catch(() => undefined);
        }
        await pushService.subscribe({ ...rotated.next, surface: "lms" });
        return "granted";
      }
    } catch {
      // Fall through — the server's 403 pruning is the backstop.
    }
  }

  const existing = await getExistingSubscription();
  return existing ? "granted" : "prompt";
}

/**
 * Everything a screen needs to offer push: what state this device is
 * in, and functions to subscribe and unsubscribe.
 *
 * `enable()` must be called from a user gesture — see
 * `requestAndSubscribe`. Nothing here prompts on mount. `resolved` is
 * false until the device check has finished, so a caller can stay
 * hidden instead of flashing an offer it would then withdraw.
 */
export function usePushSubscription() {
  const qc = useQueryClient();
  const { data: config, isPending: configPending } = usePushConfig();
  const deviceKey = PUSH_QUERY_KEYS.device(config?.publicKey ?? null);

  const device = useQuery({
    queryKey: deviceKey,
    queryFn: () => resolveDeviceState(config),
    enabled: !configPending,
    staleTime: Infinity,
    retry: false,
  });

  const setState = (next: PushState) => qc.setQueryData(deviceKey, next);

  const enableMutation = useMutation({
    mutationFn: async (): Promise<boolean> => {
      if (!config?.publicKey) return false;
      const sub = await requestAndSubscribe(config.publicKey);
      if (!sub) {
        // Declined. Reflect it so the UI stops offering — the browser
        // will not ask again for this origin once it's "denied".
        setState(Notification.permission === "denied" ? "denied" : "prompt");
        return false;
      }
      await pushService.subscribe({ ...sub, surface: "lms" });
      setState("granted");
      return true;
    },
  });

  const disableMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const endpoint = await dropLocalSubscription();
      // Drop it server-side too, otherwise we keep pushing into a
      // subscription the browser has already thrown away.
      if (endpoint) await pushService.unsubscribe(endpoint);
      setState("prompt");
    },
  });

  // Registration or network failure leaves the state alone so the
  // student can try again; the browser permission is unaffected.
  const enable = () => enableMutation.mutateAsync().catch(() => false);
  const disable = () => disableMutation.mutateAsync().catch(() => undefined);

  return {
    state: device.data ?? "prompt",
    resolved: device.isSuccess,
    busy: enableMutation.isPending || disableMutation.isPending,
    enable,
    disable,
  };
}
