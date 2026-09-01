"use client";

import React from "react";
import { Bell, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotificationPrefs,
  useUpdateNotificationPrefs,
} from "../api/push.queries";

export function NotificationSettingsCard() {
  const { data: prefs, isLoading } = useNotificationPrefs();
  const update = useUpdateNotificationPrefs();

  if (isLoading) {
    return (
      <Card className="p-5 space-y-4 rounded-2xl border bg-card">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </Card>
    );
  }

  const pushActive = prefs?.push ?? true;
  const whatsappActive = prefs?.whatsapp ?? true;

  return (
    <Card className="p-5 md:p-6 space-y-5 rounded-2xl border bg-card shadow-sm">
      <div>
        <h2 className="font-semibold text-base text-foreground">Notification Settings</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your notification channels. Critical security & account updates are always delivered to your email and in-app bell.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 border-t pt-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
            <Bell className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Push Notifications</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Receive live updates on course activity, grades, and live sessions on your device.
            </p>
          </div>
        </div>
        <Switch
          checked={pushActive}
          disabled={update.isPending}
          onCheckedChange={(checked) => update.mutate({ push: checked })}
        />
      </div>

      <div className="flex items-center justify-between gap-4 border-t pt-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">WhatsApp Notifications</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Payment receipts and urgent cohort announcements directly on WhatsApp.
            </p>
          </div>
        </div>
        <Switch
          checked={whatsappActive}
          disabled={update.isPending}
          onCheckedChange={(checked) => update.mutate({ whatsapp: checked })}
        />
      </div>
    </Card>
  );
}
