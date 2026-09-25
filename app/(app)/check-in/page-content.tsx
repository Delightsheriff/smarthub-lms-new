"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  ShieldAlert,
  ShieldX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type CheckInState =
  | { kind: "loading" }
  | { kind: "ok" }
  | { kind: "already" }
  | { kind: "expired" }
  | { kind: "not-enrolled" }
  | { kind: "invalid" }
  | { kind: "missing-params" }
  | { kind: "error"; message: string };

interface CheckInResponse {
  status: "ok" | "already-checked-in";
  rowStatus?: string;
}

/**
 * Client half of the check-in route — reads `token`/`session` from the
 * URL, so it must live under a `<Suspense>` boundary for the static
 * build (the server `page.tsx` provides it).
 */
export default function CheckInPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const sessionId = params.get("session");

  const [state, setState] = useState<CheckInState>({ kind: "loading" });
  // StrictMode runs effects twice in dev — guard so the POST only
  // fires once per mount.
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    (async () => {
      if (!token || !sessionId) {
        setState({ kind: "missing-params" });
        return;
      }

      try {
        // The mock serves `{ status: "ok" }` directly (no envelope),
        // so the api client resolves to the CheckInResponse itself.
        const r = await apiClient.post<CheckInResponse>(
          `/lms/class-sessions/${sessionId}/check-in`,
          { token },
          // Suppress the interceptor toast — the page itself is the UI.
          { silent: true },
        );
        setState(
          r.status === "already-checked-in"
            ? { kind: "already" }
            : { kind: "ok" },
        );
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 410) return setState({ kind: "expired" });
          if (err.status === 403) return setState({ kind: "not-enrolled" });
          if (err.status === 401) return setState({ kind: "invalid" });
          return setState({ kind: "error", message: err.message });
        }
        setState({
          kind: "error",
          message: "Something went wrong. Try scanning again.",
        });
      }
    })();
  }, [token, sessionId]);

  // Auto-redirect home on the two "you're good" states.
  useEffect(() => {
    if (state.kind !== "ok" && state.kind !== "already") return;
    const t = setTimeout(() => router.replace("/"), 4000);
    return () => clearTimeout(t);
  }, [state.kind, router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 md:p-8 text-center rounded-2xl border border-border bg-card shadow-sm">
        <Content state={state} />
      </Card>
    </div>
  );
}

function Content({ state }: { state: CheckInState }) {
  switch (state.kind) {
    case "loading":
      return (
        <div className="space-y-3">
          <Loader2 className="h-10 w-10 text-muted-foreground mx-auto animate-spin" />
          <p className="text-sm text-muted-foreground">Checking you in…</p>
        </div>
      );
    case "ok":
      return (
        <Result
          tone="success"
          icon={CheckCircle2}
          title="You're marked present"
          body="You're checked in for this class. Have a great session."
          showHomeCta
        />
      );
    case "already":
      return (
        <Result
          tone="info"
          icon={Info}
          title="You were already checked in"
          body="No need to scan again — you're on the roster for this class."
          showHomeCta
        />
      );
    case "expired":
      return (
        <Result
          tone="warning"
          icon={AlertTriangle}
          title="QR expired"
          body="The QR code refreshes every few seconds. Scan the fresh one on the screen."
        />
      );
    case "not-enrolled":
      return (
        <Result
          tone="warning"
          icon={ShieldAlert}
          title="Not enrolled in this cohort"
          body="If this is a mistake, message support and we'll sort it out."
        />
      );
    case "invalid":
      return (
        <Result
          tone="warning"
          icon={ShieldX}
          title="Couldn't verify that QR"
          body="The code may have been mis-scanned. Try again."
        />
      );
    case "missing-params":
      return (
        <Result
          tone="warning"
          icon={ShieldX}
          title="Missing check-in details"
          body="This link is incomplete. Scan the QR on the classroom screen."
        />
      );
    case "error":
      return (
        <Result
          tone="warning"
          icon={AlertTriangle}
          title="Something went wrong"
          body={state.message}
        />
      );
  }
}

function Result({
  tone,
  icon: Icon,
  title,
  body,
  showHomeCta,
}: {
  tone: "success" | "info" | "warning";
  icon: typeof CheckCircle2;
  title: string;
  body: string;
  showHomeCta?: boolean;
}) {
  const toneClass = {
    success: "text-success",
    info: "text-primary",
    warning: "text-warning",
  }[tone];
  return (
    <div className="space-y-4">
      <Icon className={cn("h-14 w-14 mx-auto", toneClass)} />
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      {showHomeCta && (
        <div className="pt-2">
          <Button nativeButton={false} render={<Link href="/" />} className="rounded-xl">Go now</Button>
          <p className="text-[11px] text-muted-foreground mt-2">
            We&apos;ll take you home automatically.
          </p>
        </div>
      )}
    </div>
  );
}