export const urlBase64ToUint8Array = (base64: string): Uint8Array<ArrayBuffer> => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalised = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalised);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
};

export const isPushSupported = (): boolean =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

export const isIOS = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

export const isStandalone = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> =>
  navigator.serviceWorker.register("/sw.js", { scope: "/" });

export interface RawSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

const toRaw = (sub: PushSubscription): RawSubscription => {
  const json = sub.toJSON() as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  return {
    endpoint: sub.endpoint,
    keys: {
      p256dh: json.keys?.p256dh ?? "",
      auth: json.keys?.auth ?? "",
    },
  };
};

export const requestAndSubscribe = async (
  vapidPublicKey: string,
): Promise<RawSubscription | null> => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const registration = await registerServiceWorker();
  await navigator.serviceWorker.ready;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return toRaw(existing);

  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
  return toRaw(sub);
};

export const getExistingSubscription = async (): Promise<RawSubscription | null> => {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration("/");
  if (!registration) return null;
  const sub = await registration.pushManager.getSubscription();
  return sub ? toRaw(sub) : null;
};

export const dropLocalSubscription = async (): Promise<string | null> => {
  const registration = await navigator.serviceWorker.getRegistration("/");
  const sub = await registration?.pushManager.getSubscription();
  if (!sub) return null;
  const { endpoint } = sub;
  await sub.unsubscribe();
  return endpoint;
};

/**
 * Base64url-encode the raw key bytes a subscription was created with,
 * so it can be compared against the string form the server serves.
 */
const encodeKey = (buf: ArrayBuffer | null): string | null => {
  if (!buf) return null;
  const binary = Array.from(new Uint8Array(buf), (b) => String.fromCharCode(b)).join("");
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/**
 * True when this browser holds a subscription created against a
 * DIFFERENT VAPID key than the server now signs with. Such a
 * subscription is permanently unusable (the push service rejects the
 * JWT with a 403) but looks healthy locally. When the browser doesn't
 * expose `applicationServerKey`, returns false rather than guess and
 * leaves it to the server's 403 pruning.
 */
export const hasStaleVapidKey = async (currentPublicKey: string): Promise<boolean> => {
  if (!isPushSupported()) return false;
  const registration = await navigator.serviceWorker.getRegistration("/");
  const sub = await registration?.pushManager.getSubscription();
  if (!sub) return false;

  const existing = encodeKey(sub.options?.applicationServerKey ?? null);
  if (!existing) return false;
  return existing !== currentPublicKey;
};

/**
 * Replace a subscription bound to an old key. Safe without a user
 * gesture: permission is already `granted` (only the subscription died
 * in the rotation), so `subscribe()` resolves without prompting.
 * Returns the old endpoint so the caller can drop the server row.
 */
export const resubscribeWithCurrentKey = async (
  vapidPublicKey: string,
): Promise<{ oldEndpoint: string | null; next: RawSubscription } | null> => {
  if (Notification.permission !== "granted") return null;

  const registration = await registerServiceWorker();
  await navigator.serviceWorker.ready;

  const existing = await registration.pushManager.getSubscription();
  const oldEndpoint = existing?.endpoint ?? null;
  if (existing) await existing.unsubscribe();

  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
  return { oldEndpoint, next: toRaw(sub) };
};
