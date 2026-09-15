"use client";
import { Award, Download, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import type { SelfPacedCertificate } from "../types";

/**
 * Completion certificate for a self-paced course. Worded as a course
 * completion so it isn't mistaken for the certificate a full cohort
 * track awards.
 *
 * Generation is asynchronous: until the certificate lands on the course
 * payload this shows a preparing state (the caller refetches).
 */
export function CertificateCard({
  courseName,
  certificate,
  completedAt,
  className,
}: {
  courseName: string;
  certificate?: SelfPacedCertificate;
  completedAt?: string;
  className?: string;
}) {
  const share = async () => {
    if (!certificate?.url) return;
    const payload = {
      title: `${courseName} — certificate of completion`,
      text: `I completed the self-paced course ${courseName} on SmartHub. Certificate ref ${certificate.refNumber}.`,
      url: certificate.url,
    };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(certificate.url);
      toast.success("Certificate link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <Card
      className={cn(
        "p-5 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-background to-amber-500/5",
        className
      )}
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
          <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">Certificate of completion</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Self-paced course
            {completedAt ? ` · completed ${formatDate(completedAt, "long")}` : ""}
          </p>

          {certificate ? (
            <>
              <p className="mt-2 text-xs text-muted-foreground">
                Reference{" "}
                <span className="font-mono text-foreground">
                  {certificate.refNumber}
                </span>{" "}
                — anyone can use it to confirm the certificate is genuine.
              </p>
              {certificate.url ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    render={
                      <a href={certificate.url} target="_blank" rel="noopener noreferrer" />
                    }
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={share}>
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  The download will be available shortly.
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing your certificate — this usually takes a few seconds.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
