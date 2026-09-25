import { storageService } from "@/lib/services/storage.service";
import { STORAGE_KEYS } from "@/lib/constants/storage";
import { isPromptSnoozed } from "./push-state";

/**
 * The push prompt's "Not now" memory, as an external store for
 * `useSyncExternalStore`: reading localStorage during render would
 * mismatch hydration, and syncing it through an effect would render the
 * prompt once before hiding it. The server snapshot says "snoozed", so
 * the prompt never appears in SSR markup or on first paint.
 */
const listeners = new Set<() => void>();

export const subscribeToPromptDismissal = (fn: () => void): (() => void) => {
  listeners.add(fn);
  // Another tab dismissing it should hide it here too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.PUSH_PROMPT_DISMISSED_AT) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
};

export const getPromptSnoozedSnapshot = (): boolean =>
  isPromptSnoozed(storageService.get(STORAGE_KEYS.PUSH_PROMPT_DISMISSED_AT), Date.now());

export const getPromptSnoozedServerSnapshot = (): boolean => true;

export const dismissPushPrompt = (): void => {
  storageService.set(STORAGE_KEYS.PUSH_PROMPT_DISMISSED_AT, String(Date.now()));
  listeners.forEach((fn) => fn());
};
