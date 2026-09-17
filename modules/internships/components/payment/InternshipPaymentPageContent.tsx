"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Landmark,
  Loader2,
  ReceiptText,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  useInternshipPayment,
  useSubmitInternshipPaymentProof,
} from "../../api/internships.queries";
import type { ApiInternshipPayment } from "../../types/api.types";

/** `/internships/me/payment` — the internship fee surface. Self-gating
 *  like the dashboard tiles: no applicable payment renders an empty
 *  state, a confirmed payment shows the receipt strip. */
export function InternshipPaymentPageContent() {
  const { data, isLoading } = useInternshipPayment();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="No internship payment"
        description="Your internship is fully covered or you have no active placement — there's nothing to pay for right now."
        action={
          <Button variant="outline" render={<Link href="/internships" />}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to internship
          </Button>
        }
      />
    );
  }

  const settled = data.paymentStatus === "completed";

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        eyebrow="Internship"
        title="Internship fee"
        description={
          settled
            ? "Your internship fee is paid in full."
            : "Complete your payment to keep your placement active."
        }
      />

      {settled ? (
        <ConfirmedReceipt payment={data} />
      ) : data.paymentProofUrl ? (
        <AwaitingConfirmation payment={data} />
      ) : (
        <PendingPayment payment={data} />
      )}
    </div>
  );
}

function ConfirmedReceipt({ payment }: { payment: ApiInternshipPayment }) {
  return (
    <Card className="p-6 rounded-2xl border border-success/30 bg-success/5 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold text-foreground">
            {formatPrice(payment.fee)} — paid in full
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Reference:{" "}
            <span className="font-mono text-xs">
              {payment.paymentReference || "—"}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Confirmed {payment.paymentConfirmedAt ? formatDate(payment.paymentConfirmedAt) : ""}
          </p>
        </div>
      </div>
    </Card>
  );
}

function AwaitingConfirmation({ payment }: { payment: ApiInternshipPayment }) {
  return (
    <Card className="p-6 rounded-2xl border border-info/30 bg-info/5 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-info/10 text-info">
          <Clock3 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold text-foreground">Proof submitted — awaiting confirmation</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your receipt is in for{" "}
            {formatPrice(payment.fee - payment.paidAmount)}, submitted{" "}
            {payment.paymentProofSubmittedAt
              ? formatDate(payment.paymentProofSubmittedAt)
              : ""}
            .
          </p>
          {payment.paymentReference && (
            <p className="mt-1 text-sm text-muted-foreground">
              Reference:{" "}
              <span className="font-mono text-xs">{payment.paymentReference}</span>
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Finance confirms each receipt — usually within a day. This page
            updates automatically once they do.
          </p>
        </div>
      </div>
    </Card>
  );
}

function PendingPayment({ payment }: { payment: ApiInternshipPayment }) {
  const [open, setOpen] = useState(false);
  const mutation = useSubmitInternshipPaymentProof();

  return (
    <div className="space-y-4">
      <Card className="p-5 md:p-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Landmark className="h-4 w-4 text-primary" />
            {payment.bank?.bankName}
          </div>
          <span className="text-sm font-semibold text-destructive">
            {formatPrice(payment.fee - payment.paidAmount)} outstanding
          </span>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Account name" value={payment.bank?.accountName} mono />
          <Field label="Account number" value={payment.bank?.accountNumber} mono />
          <Field label="Fee" value={formatPrice(payment.fee)} />
        </div>
        {payment.bank?.paymentInstructions && (
          <p className="mt-4 rounded-xl bg-accent/50 px-3 py-2 text-xs text-muted-foreground">
            {payment.bank.paymentInstructions}
          </p>
        )}
        <div className="mt-5 flex justify-end">
          <Button onClick={() => setOpen(true)} className="rounded-xl">
            <UploadCloud className="h-4 w-4 mr-1.5" />
            Upload payment proof
          </Button>
        </div>
      </Card>

      <UploadProofDialog
        open={open}
        onOpenChange={setOpen}
        pending={mutation.isPending}
        onSubmit={async (input) => {
          await mutation.mutateAsync(input);
          setOpen(false);
        }}
      />
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={"mt-0.5 text-sm font-semibold" + (mono ? " font-mono" : "")}>
        {value || "—"}
      </p>
    </div>
  );
}

function UploadProofDialog({
  open,
  onOpenChange,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  onSubmit: (input: { file: File; reference?: string }) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const form = useForm<{ reference: string }>({
    resolver: zodResolver(z.object({ reference: z.string().max(500, "Reference must be 500 characters or fewer") })),
    defaultValues: { reference: "" },
  });

  const submit = async ({ reference }: { reference: string }) => {
    if (!file) {
      form.setError("reference", { message: "Attach your transfer receipt first." });
      return;
    }
    try {
      await onSubmit({ file, reference: reference.trim() || undefined });
      setFile(null);
      form.reset();
    } catch {
      // Interceptor toasts the error; keep the dialog open for retry.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Upload internship payment</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Send your transfer receipt so finance can confirm your fee.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}><form className="space-y-3" onSubmit={form.handleSubmit(submit)}>
          <Label
            htmlFor="internship-proof-file"
            className="block cursor-pointer rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground hover:border-primary/40"
          >
            <UploadCloud className="mx-auto mb-1 h-5 w-5" />
            {file ? (
              <span className="font-medium text-foreground">{file.name}</span>
            ) : (
              <span>Tap to attach your receipt (image or PDF)</span>
            )}
            <Input
              id="internship-proof-file"
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
               onChange={(e) => setFile(e.target.files?.[0] ?? null)}
               disabled={pending || form.formState.isSubmitting}
            />
          </Label>
           <FormField control={form.control} name="reference" render={({ field }) => <FormItem className="grid gap-1.5"><FormLabel>Transfer reference (optional)</FormLabel><FormControl><Input placeholder="From your bank app" disabled={pending || form.formState.isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>} />
         </form></Form>
        <DialogFooter>
          <Button
            variant="outline"
             onClick={() => onOpenChange(false)}
             disabled={pending || form.formState.isSubmitting}
          >
            Cancel
          </Button>
           <Button type="submit" form={undefined} onClick={() => void form.handleSubmit(submit)()} disabled={pending || !file || form.formState.isSubmitting}>
            {pending || form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Submit proof"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
