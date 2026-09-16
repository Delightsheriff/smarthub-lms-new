"use client";
import { useMemo } from "react";
import {
  BookOpen,
  Briefcase,
  Copy,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/**
 * One row per program — a labelled share link a referrer can copy or
 * push to WhatsApp. Used on the Refer & earn surface (three stacked
 * on the Share tab; one inline at the top of each Applications
 * sub-tab so the referrer can share that specific program in place).
 *
 * Share URLs point at the PUBLIC client origin — not the LMS —
 * because the recipient isn't enrolled yet. The marketing site's
 * landing pages save `?ref=<CODE>` to localStorage and downstream
 * apply forms read it back. Single param key keeps the funnel from
 * dropping the code when the referee bounces between marketing pages.
 */

const PROGRAMS = {
  siwes: {
    label: "SIWES / IT placement",
    path: "/student-program",
    blurb: "Share with friends looking for an IT placement.",
    icon: Briefcase,
  },
  course: {
    label: "Courses",
    path: "/courses",
    blurb:
      "Share the course catalogue — any enrolment earns you a commission.",
    icon: BookOpen,
  },
  scholarship: {
    label: "Tech Scholarship",
    path: "/scholarship",
    blurb: "Share the scholarship — open to everyone, funded learning.",
    icon: GraduationCap,
  },
} as const;

type ProgramKey = keyof typeof PROGRAMS;

interface Props {
  program: ProgramKey;
  code: string | null | undefined;
  /** Compact variant for inline use on Applications sub-tabs.
   *  Drops the card chrome + icon header, leaves URL + buttons. */
  compact?: boolean;
  /** Platform-wide commission % (0–100). Surfaced in the per-program
   *  blurb so the referrer sees exactly what they earn before sharing. */
  commissionRate?: number;
}

/**
 * The public marketing origin. Resolution order:
 *  1. `NEXT_PUBLIC_PUBLIC_CLIENT_URL` — the explicit override. Set
 *     this in prod / staging env so the URL is deterministic.
 *  2. Derived from `window.location` — strip the LMS subdomain off
 *     the current host. `learn.smart-hub.academy` →
 *     `https://smart-hub.academy`. Works for any deployment where
 *     the LMS lives on a `learn.` (or similar) subdomain.
 *  3. SSR fallback — empty origin. The component re-renders on the
 *     client where window is available, so the link briefly shows
 *     just the path before resolving. Acceptable trade-off vs.
 *     hard-coding a wrong host.
 */
const publicOrigin = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_PUBLIC_CLIENT_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const { protocol, host } = window.location;
    // Only strip the first segment when there are 3+ segments (i.e. a
    // real subdomain). For 2-segment hosts (`example.com`) or
    // localhost we'd otherwise produce nonsense like `com`. In dev,
    // the env var is the right tool — the LMS port and the public
    // client port differ.
    const parts = host.split(".");
    const base = parts.length >= 3 ? parts.slice(1).join(".") : host;
    return `${protocol}//${base}`;
  }

  return "";
};

export function ProgramShareLink({
  program,
  code,
  compact,
  commissionRate,
}: Props) {
  const config = PROGRAMS[program];
  const rateLabel =
    typeof commissionRate === "number" && commissionRate > 0
      ? `${commissionRate}%`
      : null;
  const Icon = config.icon;

  const shareUrl = useMemo(() => {
    if (!code) return "";
    return `${publicOrigin()}${config.path}?ref=${code}`;
  }, [code, config.path]);

  const onCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(`${config.label} link copied`);
    } catch {
      toast.error("Could not copy. Please copy manually.");
    }
  };

  const waUrl = useMemo(() => {
    if (!shareUrl) return "";
    const text = `Apply for ${config.label} on SmartHub — use my link to track your application: ${shareUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [shareUrl, config.label]);

  if (!code) {
    return (
      <div className="rounded-md border border-input bg-muted/50 p-3 text-sm text-muted-foreground">
        {config.label} link not ready yet — refresh in a moment.
      </div>
    );
  }

  const Body = (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
      <Input
        readOnly
        value={shareUrl}
        onClick={(e) => (e.target as HTMLInputElement).select()}
        className="flex-1 h-9 rounded-lg bg-card font-mono text-xs"
      />
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onCopy}
          className="h-9 px-3.5 rounded-lg"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          render={
            <a href={waUrl} target="_blank" rel="noopener noreferrer" />
          }
          className="h-9 px-3.5 rounded-lg bg-card hover:bg-card/90"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </Button>
      </div>
    </div>
  );

  if (compact) return Body;

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {config.label}
          </p>
          <p className="text-xs text-muted-foreground">
            {config.blurb}
            {rateLabel && (
              <>
                {" "}
                <strong className="text-primary">Earn {rateLabel}</strong> of
                every payment they make.
              </>
            )}
          </p>
        </div>
      </div>
      {Body}
    </Card>
  );
}