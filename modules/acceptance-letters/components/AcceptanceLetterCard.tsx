"use client";
import { Download, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { downloadFile } from "@/lib/cloudinary-download";
import { formatDate } from "@/lib/utils";
import { useAcceptanceLetters } from "../api/acceptance-letters.queries";
import type { AcceptanceLetter } from "../types";

/**
 * Dashboard tile for the student's SIWES acceptance letter(s).
 * Hidden when the student has none — non-SIWES enrollments never
 * see this card.
 *
 * Post-Architecture-A, the per-applicant letter service issues ONE
 * letter covering every enrolled programme. The query dedupes by
 * ref number so the student typically sees a single card here
 * (one row per applicant they've applied as).
 */
export function AcceptanceLetterCard() {
  const { data, isLoading } = useAcceptanceLetters();

  if (isLoading) return null;
  if (!data || data.length === 0) return null;

  // Single letter (the common case): one compact row matching the
  // billing widget's height so the dashboard's status row stays
  // even. Multiple letters keep the stacked list inside one card —
  // rare, but it happens when a student has applied across years.
  if (data.length === 1) {
    const letter = data[0];
    return (
      <Card className="rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-primary/20 bg-primary/5 shadow-sm hover:border-primary/40 transition-all">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
              SIWES acceptance letter
            </p>
            <p className="text-sm font-semibold truncate">
              <span className="font-mono text-xs text-muted-foreground mr-1">
                {letter.refNumber}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 self-start sm:self-auto">
          <LetterButtons letter={letter} />
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border bg-card p-0 overflow-hidden shadow-sm">
      <div className="px-4 pt-3 pb-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
          Acceptance letters
        </p>
      </div>
      <ul className="divide-y">
        {data.map((letter) => (
          <li
            key={letter.registrationId}
            className="p-3 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight truncate">
                <span className="font-mono">{letter.refNumber}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                {letter.issuedAt
                  ? `Issued ${formatDate(letter.issuedAt)}`
                  : ""}
                {letter.institutionName
                  ? `${letter.issuedAt ? " · " : ""}${letter.institutionName}`
                  : ""}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <LetterButtons letter={letter} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function LetterButtons({ letter }: { letter: AcceptanceLetter }) {
  const title = letter.refNumber;
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        render={
          <a href={letter.url} target="_blank" rel="noreferrer" />
        }
      >
        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
        View
      </Button>
      <Button
        size="sm"
        onClick={() => {
          void downloadFile(letter.url, title, "application/pdf");
        }}
      >
        <Download className="h-3.5 w-3.5 mr-1.5" />
        Download
      </Button>
    </>
  );
}