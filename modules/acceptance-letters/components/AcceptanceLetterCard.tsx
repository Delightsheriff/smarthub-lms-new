"use client";
import { NagItem } from "@/components/ui/ledger";
import { downloadFile } from "@/lib/cloudinary-download";
import { formatDate } from "@/lib/utils";
import { useAcceptanceLetters } from "../api/acceptance-letters.queries";
import type { AcceptanceLetter } from "../types";

/**
 * Acceptance-letter row(s) in the dashboard's "Needs a look" ledger.
 * Hidden when the student has none — non-SIWES enrollments never
 * see this row.
 *
 * Post-Architecture-A, the per-applicant letter service issues ONE
 * letter covering every enrolled programme. The query dedupes by
 * ref number so the student typically sees a single row here (one
 * per applicant they've applied as) — multiple rows render fine
 * inside the same ledger when a student has applied across years.
 */
export function AcceptanceLetterCard() {
  const { data, isLoading } = useAcceptanceLetters();

  if (isLoading) return null;
  if (!data || data.length === 0) return null;

  return (
    <>
      {data.map((letter) => (
        <NagItem
          key={letter.registrationId}
          tone="info"
          title={
            <>
              SIWES acceptance letter{" "}
              <span className="font-mono text-muted-foreground">{letter.refNumber}</span>
            </>
          }
          meta={
            letter.issuedAt
              ? `Issued ${formatDate(letter.issuedAt)}${letter.institutionName ? ` · ${letter.institutionName}` : ""}`
              : letter.institutionName || undefined
          }
          actions={<LetterActions letter={letter} />}
        />
      ))}
    </>
  );
}

function LetterActions({ letter }: { letter: AcceptanceLetter }) {
  return (
    <div className="flex shrink-0 items-center gap-3 font-mono text-[11px] font-medium">
      <a
        href={letter.url}
        target="_blank"
        rel="noreferrer"
        className="text-primary hover:underline"
      >
        View
      </a>
      <button
        onClick={() => void downloadFile(letter.url, letter.refNumber, "application/pdf")}
        className="text-primary hover:underline"
      >
        Download
      </button>
    </div>
  );
}