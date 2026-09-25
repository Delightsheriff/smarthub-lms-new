/**
 * SmartHub LMS service worker.
 *
 * Deliberately does NOT cache anything. Offline support is a separate
 * problem with its own failure modes (stale course content, a student
 * submitting against a cached deadline), and shipping it accidentally
 * as a side effect of wanting push would be worse than not having it.
 * This worker exists for one job: receive pushes and open the app on
 * the right page when one is tapped.
 *
 * Ported from the legacy LMS (smarthub-core-lms/public/sw.js). The
 * route tree here matches legacy's, so the API's `url` (the same value
 * as `Notification.actionUrl`) lands as-is; `resolveTarget` below only
 * handles the cases a bare `client.navigate(url)` got wrong.
 */

const FALLBACK_URL = "/dashboard";

// Take over immediately rather than waiting for every tab to close.
// Without these two the first install does nothing until the student
// closes the app entirely, which reads as "notifications didn't work".
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim())
);

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    // A push with a non-JSON body is not worth dropping on the floor —
    // show something rather than nothing.
    payload = { title: "SmartHub", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "SmartHub";
  const options = {
    body: payload.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    // Collapse repeats of the same subject instead of stacking six
    // "payment due" notifications on the lock screen.
    tag: payload.tag || undefined,
    data: { url: payload.url || FALLBACK_URL },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Turn the payload's `url` into an absolute URL and say whether it
 * belongs to this app. Relative paths ("/payments", "payments") resolve
 * against the worker's origin; an absolute link to somewhere else (a
 * calendar reminder's meeting link, a WhatsApp group) stays external so
 * it opens in its own window instead of hijacking the app's tab.
 */
const resolveTarget = (raw) => {
  const value = typeof raw === "string" && raw.trim() ? raw.trim() : FALLBACK_URL;
  try {
    const url = new URL(value, self.location.origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { href: new URL(FALLBACK_URL, self.location.origin).href, internal: true };
    }
    return { href: url.href, internal: url.origin === self.location.origin };
  } catch {
    return { href: new URL(FALLBACK_URL, self.location.origin).href, internal: true };
  }
};

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = resolveTarget(event.notification.data && event.notification.data.url);

  if (!target.internal) {
    event.waitUntil(self.clients.openWindow(target.href));
    return;
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (clients) => {
        // Prefer focusing a window that's already open on this app and
        // navigating it. Opening a second window every time would leave
        // students with a pile of duplicate app instances.
        const client = clients.find(
          (c) => new URL(c.url).origin === self.location.origin && "focus" in c
        );
        if (!client) return self.clients.openWindow(target.href);

        await client.focus();
        if ("navigate" in client) {
          // `navigate` rejects for a window this worker doesn't control
          // yet (open before the worker activated) — fall back to a new
          // window rather than doing nothing.
          try {
            return await client.navigate(target.href);
          } catch {
            return self.clients.openWindow(target.href);
          }
        }
        return undefined;
      })
  );
});
