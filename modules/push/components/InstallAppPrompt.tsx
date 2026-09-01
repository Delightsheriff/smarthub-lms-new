"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storageService } from "@/lib/services/storage.service";
import { STORAGE_KEYS } from "@/lib/constants/storage";
import {
  isInstallAvailable,
  promptInstall,
  subscribeToInstallAvailability,
} from "../lib/install-prompt";
import { isIOS, isStandalone } from "../lib/browser-push";

const SNOOZE_MS = 60 * 24 * 60 * 60 * 1000;

export function InstallAppPrompt() {
  const [available, setAvailable] = useState(() => {
    if (typeof window === "undefined") return false;
    return isInstallAvailable();
  });
  const [hidden, setHidden] = useState(() => {
    if (typeof window === "undefined" || isStandalone()) return true;
    const at = Number(
      storageService.get(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED_AT) ?? 0,
    );
    return Number.isFinite(at) && Date.now() - at < SNOOZE_MS;
  });
  const [iosHelp, setIosHelp] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hidden) return;
    return subscribeToInstallAvailability(setAvailable);
  }, [hidden]);

  const dismiss = () => {
    storageService.set(
      STORAGE_KEYS.INSTALL_PROMPT_DISMISSED_AT,
      String(Date.now()),
    );
    setHidden(true);
  };

  const install = async () => {
    setBusy(true);
    try {
      const accepted = await promptInstall();
      if (accepted) setHidden(true);
      else dismiss();
    } finally {
      setBusy(false);
    }
  };

  if (hidden) return null;

  const onIOS = isIOS();
  if (!available && !onIOS) return null;

  return (
    <div
      className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 md:inset-x-auto md:right-6 md:bottom-6 md:max-w-sm"
      role="complementary"
      aria-label="Install SmartHub"
    >
      <div className="relative rounded-2xl border bg-card p-4 shadow-lg">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 text-muted-foreground rounded-md"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-start gap-3 pr-8">
          <span className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
            <Download className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground">Install SmartHub</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add it to your home screen for quick access and offline caching.
            </p>

            {onIOS && !available ? (
              iosHelp ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Tap{" "}
                  <Share
                    className="inline h-3.5 w-3.5 align-[-2px]"
                    aria-hidden
                  />{" "}
                  <span className="font-medium text-foreground">Share</span> in
                  Safari, then{" "}
                  <span className="font-medium text-foreground">
                    Add to Home Screen
                  </span>
                  .
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setIosHelp(true)}>
                    Show me how
                  </Button>
                  <Button size="sm" variant="ghost" onClick={dismiss}>
                    Not now
                  </Button>
                </div>
              )
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" disabled={busy} onClick={() => void install()}>
                  {busy ? "Installing…" : "Install"}
                </Button>
                <Button size="sm" variant="ghost" onClick={dismiss}>
                  Not now
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
