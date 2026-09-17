"use client";

import React from "react";
import { Bell, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotificationPrefs,
  useUpdateNotificationPrefs,
} from "../api/push.queries";

export function NotificationSettingsCard() {
  const { data: prefs, isLoading } = useNotificationPrefs();
  const update = useUpdateNotificationPrefs();

  const pushActive = prefs?.push ?? true;
  const whatsappActive = prefs?.whatsapp ?? true;

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/20 p-5">
        <CardTitle className="flex items-center gap-2 text-base font-display">
          <Bell className="h-4 w-4 text-primary" /> Notification settings
        </CardTitle>
        <CardDescription>
          Manage your notification channels. Critical security & account
          updates are always delivered to your email and in-app bell.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <span className="mt-0.5 rounded-xl bg-primary/10 p-2.5 text-primary shrink-0">
                  <Bell className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Push notifications</p>
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

            <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
              <div className="flex items-start gap-3 min-w-0">
                <span className="mt-0.5 rounded-xl bg-primary/10 p-2.5 text-primary shrink-0">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">WhatsApp notifications</p>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
