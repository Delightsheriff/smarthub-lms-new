"use client";

import { useSyncExternalStore } from "react";
import { Download, Share } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  isInstallAvailable,
  promptInstall,
  subscribeToInstallAvailability,
} from "../lib/install-prompt";
import { isIOS, isStandalone } from "../lib/browser-push";

const subscribeInstall = (onChange: () => void) =>
  subscribeToInstallAvailability(() => onChange());

const subscribeDisplayMode = (onChange: () => void) => {
  const mql = window.matchMedia?.("(display-mode: standalone)");
  mql?.addEventListener("change", onChange);
  return () => mql?.removeEventListener("change", onChange);
};

const noopSubscribe = () => () => {};

/**
 * "Install app" as a permanent user-menu entry.
 *
 * `InstallAppPrompt` is a one-off offer that snoozes for 60 days once
 * dismissed — deliberately, so it doesn't nag. That leaves no way back
 * for someone who dismissed it and later wants the app on their home
 * screen. This is that way back: always in the same place, no timing.
 *
 * Renders nothing when there is nothing to offer — already running
 * installed, or a browser that hasn't fired `beforeinstallprompt`.
 * iOS is the exception: Safari never signals and never installs
 * programmatically, so the item asks the caller to open
 * `InstallAppIosHelpDialog` instead. That dialog has to live OUTSIDE
 * the menu: Base UI unmounts the menu popup on close, which would take
 * a dialog nested inside it down too.
 */
export function InstallAppMenuItem({ onShowIosHelp }: { onShowIosHelp: () => void }) {
  const available = useSyncExternalStore(subscribeInstall, isInstallAvailable, () => false);
  // Server snapshot says "installed" so nothing renders until the
  // client has actually checked.
  const installed = useSyncExternalStore(subscribeDisplayMode, isStandalone, () => true);
  const onIOS = useSyncExternalStore(noopSubscribe, isIOS, () => false);

  if (installed) return null;
  if (!available && !onIOS) return null;

  return (
    <DropdownMenuItem
      onClick={() => {
        if (onIOS && !available) {
          onShowIosHelp();
          return;
        }
        // `prompt()` needs a user gesture; this click IS one, so it must
        // not be deferred behind the menu's close animation.
        void promptInstall();
      }}
    >
      <Download />
      Install app
    </DropdownMenuItem>
  );
}

/** Safari's Share → Add to Home Screen instructions, for iOS. */
export function InstallAppIosHelpDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add SmartHub to your home screen</AlertDialogTitle>
          <AlertDialogDescription render={<div />} className="space-y-2">
            <p>
              Safari installs apps from its Share menu rather than a button, so it takes
              two taps:
            </p>
            <p>
              Tap <Share className="inline h-3.5 w-3.5 align-[-2px]" aria-hidden />{" "}
              <span className="font-medium text-foreground">Share</span> at the bottom of
              Safari, then{" "}
              <span className="font-medium text-foreground">Add to Home Screen</span>.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>Got it</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
