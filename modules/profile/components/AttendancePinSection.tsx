"use client";
import { useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDateTime } from "@/lib/utils";
import { useRotateAttendancePin } from "../api/attendance-pin.queries";

/**
 * Rotate-once attendance PIN. The raw PIN is surfaced exactly once per
 * rotation (held in component state), then copy-to-clipboard is offered.
 */
export function AttendancePinSection() {
  const rotate = useRotateAttendancePin();
  const [showing, setShowing] = useState<{ rawPin: string; issuedAt: string } | null>(null);
  const [lastIssuedAt, setLastIssuedAt] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const doRotate = async () => {
    try {
      const result = await rotate.mutateAsync();
      if (result?.rawPin) {
        setShowing({ rawPin: result.rawPin, issuedAt: result.issuedAt });
        setLastIssuedAt(result.issuedAt);
      }
      setConfirmOpen(false);
    } catch {
      // interceptor toasts
    }
  };

  const copyPin = async () => {
    if (!showing) return;
    try {
      await navigator.clipboard.writeText(showing.rawPin);
      setCopied(true);
      toast.success("PIN copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy. Please copy manually.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="h-4 w-4" /> Attendance PIN
        </CardTitle>
        <CardDescription>
          Your PIN lets you check in for attendance at on-site sessions. Rotating
          invalidates the previous PIN.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showing ? (
          <div className="rounded-lg border border-emerald-600/30 bg-emerald-600/5 p-4">
            <p className="text-xs text-muted-foreground">Your new PIN (shown once)</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="font-mono text-3xl font-bold tracking-widest text-emerald-700">
                {showing.rawPin}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={copyPin}>
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {lastIssuedAt
              ? `Last issued ${formatDateTime(lastIssuedAt, "long")}.`
              : "You haven't rotated a PIN yet."}
          </p>
        )}
        <Button type="button" variant="outline" onClick={() => setConfirmOpen(true)}>
          Show / reset PIN
        </Button>
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate your attendance PIN?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current PIN will stop working. A new one will be shown once.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doRotate} disabled={rotate.isPending}>
              {rotate.isPending ? "Rotating…" : "Rotate PIN"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
