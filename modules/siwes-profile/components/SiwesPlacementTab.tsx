"use client";
import { useState } from "react";
import { GraduationCap, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EditSiwesDurationDialog } from "@/modules/acceptance-letters/components/EditSiwesDurationDialog";
import { useMySiwesRegistrations } from "../api/siwes-profile.queries";
import type { SiwesRegistration } from "../types";

/**
 * Profile tab listing every SIWES registration owned by the current
 * student. Self-edit of duration lives here (moved off the
 * acceptance-letter card) so the dashboard tile stays a clean
 * download surface. Empty state intentionally renders so the tab is
 * stable across SIWES vs non-SIWES students — the surrounding profile
 * page renders the trigger unconditionally.
 */
export function SiwesPlacementTab() {
  const { data, isLoading } = useMySiwesRegistrations();

  if (isLoading) {
    return (
      <Card className="p-4 md:p-5">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-4 md:p-5">
        <p className="text-sm text-muted-foreground">
          No SIWES placement on file.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((row) => (
        <SiwesRegistrationCard key={row.registrationId} row={row} />
      ))}
    </div>
  );
}

function SiwesRegistrationCard({ row }: { row: SiwesRegistration }) {
  const [editing, setEditing] = useState(false);
  // The label prefers the more specific `institutionName` (placement
  // institution as recorded on the registration); falls back to the
  // student's own `schoolName` so a row never renders as just "—"
  // when either field is present.
  const schoolLabel = row.institutionName || row.schoolName || "—";
  const editable = row.siwesDurationEditable === true;
  const value = row.siwesDurationMonths;

  return (
    <Card className="p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <GraduationCap className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            School / institution
          </p>
          <p className="text-sm font-medium truncate">{schoolLabel}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span>
          Duration:{" "}
          <span className="font-medium text-foreground">
            {typeof value === "number" ? `${value} months` : "—"}
          </span>
        </span>
        {editable ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditing(true)}
            aria-label="Edit SIWES duration"
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        ) : (
          <span className="text-[11px]">
            Locked — contact admin to change
          </span>
        )}
        <span className="basis-full text-[11px] italic text-muted-foreground">
          Your admin regenerates the acceptance letter after this change.
        </span>
      </div>

      {editable && (
        <EditSiwesDurationDialog
          open={editing}
          onOpenChange={setEditing}
          registrationId={row.registrationId}
          currentValue={value}
        />
      )}
    </Card>
  );
}