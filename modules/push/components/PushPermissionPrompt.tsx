"use client";

import { useSyncExternalStore } from "react";
import { Bell, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePushSubscription } from "../api/push.queries";
import { isIOS } from "../lib/browser-push";
import {
  dismissPushPrompt,
  getPromptSnoozedServerSnapshot,
  getPromptSnoozedSnapshot,
  subscribeToPromptDismissal,
} from "../lib/prompt-dismissal";

/**
 * The one place the LMS asks for notification permission.
 *
 * Two rules drive the whole design:
 *
 *  1. The native prompt only ever fires from a tap on "Turn on
 *     notifications". Browsers make a denial PERMANENT for the origin
 *     with no way to re-ask, so a prompt fired on page load — before
 *     the student knows what they'd be agreeing to — costs that user
 *     forever.
 *  2. On iOS there is nothing to ask for until the app is on the Home
 *     Screen, and iOS never offers to install. So iOS Safari gets the
 *     Share-sheet instructions instead of a button that cannot work.
 *
 * Renders nothing on the server, on first paint, until the device check
 * has resolved, once granted / denied / unsupported / disabled, and
 * for 30 days after "Not now".
 */
export function PushPermissionPrompt({ className }: { className?: string }) {
  const { state, resolved, busy, enable } = usePushSubscription();
  const snoozed = useSyncExternalStore(
    subscribeToPromptDismissal,
    getPromptSnoozedSnapshot,
    getPromptSnoozedServerSnapshot,
  );

  if (snoozed || !resolved) return null;
  if (state === "granted" || state === "denied") return null;
  if (state === "unsupported" || state === "disabled") return null;
  // "needs-install" only ever occurs on iOS, but guard it anyway.
  if (state === "needs-install" && !isIOS()) return null;

  return (
    <section
      aria-label="Notifications"
      className={cn("relative rounded-2xl border border-border bg-card p-4 sm:p-5", className)}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={dismissPushPrompt}
        aria-label="Dismiss"
        className="absolute top-3 right-3 rounded-md text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="flex items-start gap-3 pr-8">
        <span className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
          <Bell className="h-4 w-4" aria-hidden />
        </span>

        {state === "needs-install" ? (
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground">
              Add SmartHub to your Home Screen
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              On iPhone, notifications only work once SmartHub is installed. Tap{" "}
              <Share className="inline h-3.5 w-3.5 align-[-2px]" aria-hidden />{" "}
              <span className="font-medium text-foreground">Share</span>, then{" "}
              <span className="font-medium text-foreground">Add to Home Screen</span>. Open
              it from there and we&apos;ll ask about notifications.
            </p>
          </div>
        ) : (
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground">Get told when it matters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll notify you when your work is graded, a recording is posted, or a
              payment is due — even when SmartHub is closed.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" disabled={busy} onClick={() => void enable()}>
                {busy ? "Turning on…" : "Turn on notifications"}
              </Button>
              <Button size="sm" variant="ghost" onClick={dismissPushPrompt}>
                Not now
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
