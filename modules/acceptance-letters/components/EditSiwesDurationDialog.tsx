"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateSiwesDuration } from "../api/acceptance-letters.queries";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  currentValue: number | undefined;
}

// 1..12 — the server enforces the same bound, this is just the
// picker contract.
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export function EditSiwesDurationDialog({
  open,
  onOpenChange,
  registrationId,
  currentValue,
}: Props) {
  const mutation = useUpdateSiwesDuration();

  const handleSave = async (value: number) => {
    try {
      await mutation.mutateAsync({ registrationId, siwesDurationMonths: value });
      onOpenChange(false);
    } catch {
      // Interceptor toasts the error; keep the dialog open so the
      // student can retry without reopening.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit SIWES duration</DialogTitle>
          <DialogDescription>
            Choose how many months your SIWES placement runs for.
          </DialogDescription>
        </DialogHeader>
        {/* Keyed by `open` so the picker re-seeds from the latest
            registration value each time the dialog opens — a
            cancel-then-reopen never strands a stale selection. */}
        {open && (
          <DurationPicker
            currentValue={currentValue}
            disabled={mutation.isPending}
            onSave={handleSave}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DurationPicker({
  currentValue,
  disabled,
  onSave,
  onCancel,
}: {
  currentValue: number | undefined;
  disabled: boolean;
  onSave: (value: number) => void;
  onCancel: () => void;
}) {
  // Default to the current value when present, otherwise 6 (the most
  // common SIWES duration).
  const [value, setValue] = useState<number>(currentValue ?? 6);

  return (
    <>
      <div className="space-y-2">
        <label
          htmlFor="siwes-duration-select"
          className="text-sm font-medium"
        >
          Duration (months)
        </label>
        <Select
          value={String(value)}
          onValueChange={(v) => setValue(Number(v ?? ""))}
        >
          <SelectTrigger
            id="siwes-duration-select"
            className="w-full"
            disabled={disabled}
          >
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            {MONTH_OPTIONS.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {m} {m === 1 ? "month" : "months"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Your admin will regenerate the letter after this change.
        </p>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={disabled}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => onSave(value)}
          disabled={disabled}
        >
          {disabled ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
}