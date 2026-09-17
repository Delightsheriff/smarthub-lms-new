"use client";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const durationSchema = z.object({
  siwesDurationMonths: z.coerce.number().int().min(1).max(12),
});

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
    } catch (error) {
      // Interceptor toasts the error; keep the dialog open so the
      // student can retry without reopening.
      throw error;
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
  onSave: (value: number) => Promise<void>;
  onCancel: () => void;
}) {
  const form = useForm<z.input<typeof durationSchema>, unknown, z.output<typeof durationSchema>>({
    resolver: zodResolver(durationSchema),
    defaultValues: { siwesDurationMonths: currentValue ?? 6 },
  });
  const duration = useWatch({ control: form.control, name: "siwesDurationMonths" });

  return (
    <form onSubmit={form.handleSubmit(async (values) => {
      await onSave(values.siwesDurationMonths);
      form.reset(values);
    })}>
      <div className="space-y-2">
        <label
          htmlFor="siwes-duration-select"
          className="text-sm font-medium"
        >
          Duration (months)
        </label>
        <Select
          value={String(duration)}
          onValueChange={(v) => form.setValue("siwesDurationMonths", Number(v ?? ""), { shouldValidate: true })}
        >
          <SelectTrigger
            id="siwes-duration-select"
            className="w-full"
            disabled={disabled}
          >
            <SelectValue placeholder="Select duration">
              {(v: string) => {
                if (!v) return "Select duration";
                const m = Number(v);
                return `${m} ${m === 1 ? "month" : "months"}`;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {MONTH_OPTIONS.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {m} {m === 1 ? "month" : "months"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.siwesDurationMonths && (
          <p className="text-sm text-destructive">Choose between 1 and 12 months.</p>
        )}
        <p className="text-xs text-muted-foreground">
          Your admin will regenerate the letter after this change.
        </p>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={disabled || form.formState.isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={disabled || form.formState.isSubmitting}
        >
          {disabled || form.formState.isSubmitting ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}
