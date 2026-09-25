"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Clock, Copy, Loader2, RotateCw, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { Ledger, LedgerItem } from "@/components/ui/ledger";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/ui/refresh-button";
import { formatFileSize, formatPrice, pluralize, RAW_MAX_BYTES } from "@/lib/utils";
import { useMyInstallmentPlans, useMyPaymentSurface, useSubmitPaymentProof } from "../api/payment-proofs.queries";
import type { MyInstallmentPlanUi, MyPaymentProofUi, PlanTrancheUi } from "../types";
import { InstallmentScheduleCard } from "./InstallmentScheduleCard";

const GENERAL = "general";
/** Receipts may be PDFs, which Cloudinary caps at 10 MB as `raw` assets —
 *  hold images to the same cap so the copy ("up to 10MB") is one rule. */
const RECEIPT_MAX_BYTES = RAW_MAX_BYTES;

function receiptError(file: File): string | null {
  if (!/^image\//.test(file.type) && file.type !== "application/pdf") {
    return "Attach an image or a PDF.";
  }
  if (file.size > RECEIPT_MAX_BYTES) {
    return `This file is ${formatFileSize(file.size)} — receipts must be 10 MB or smaller.`;
  }
  return null;
}
const paymentProofSchema = z.object({
  amount: z.string().trim().refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, "Enter an amount greater than zero"),
  reference: z.string().max(500, "Reference must be 500 characters or fewer"),
});

export function PaymentsPageContent() {
  const {
    data: surface,
    isLoading: surfaceLoading,
    isFetching: surfaceFetching,
    isError: surfaceError,
    refetch: refetchSurface,
  } = useMyPaymentSurface();
  const {
    data: plans,
    isLoading: plansLoading,
    isFetching: plansFetching,
    isError: plansError,
    refetch: refetchPlans,
  } = useMyInstallmentPlans();
  const submit = useSubmitPaymentProof();

  const isPageLoading = surfaceLoading || plansLoading;
  const isFetching = surfaceFetching || plansFetching;

  const [registration, setRegistration] = useState("general");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [tranche, setTranche] = useState<PlanTrancheUi | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<z.infer<typeof paymentProofSchema>>({
    resolver: zodResolver(paymentProofSchema),
    defaultValues: { amount: "", reference: "" },
  });

  const payTranche = (t: PlanTrancheUi, plan: MyInstallmentPlanUi) => {
    setTranche(t);
    form.setValue("amount", String(t.amount), { shouldDirty: true });
    setDone(false);
    const reg = surface?.registrations.find(
      (r) => r.courseName && plan.courseName && r.courseName === plan.courseName,
    );
    if (reg) setRegistration(reg._id);
    else setRegistration(GENERAL);
    formRef.current?.scrollIntoView({ block: "center" });
  };

  const clearTranche = () => {
    setTranche(null);
    form.setValue("amount", "", { shouldDirty: true });
    form.clearErrors("amount");
  };

  const pickFile = (next: File | null) => {
    if (!next) return;
    const error = receiptError(next);
    setFileError(error);
    setFile(error ? null : next);
    if (fileRef.current) fileRef.current.value = "";
  };

  const bank = surface?.bank;

  const copy = async (v?: string) => {
    if (!v) return;
    try {
      await navigator.clipboard.writeText(v);
      toast.success("Copied");
    } catch {
      toast.error("Couldn't copy — select the number and copy it manually.");
    }
  };

  // The form needs the surface (bank details + payable registrations);
  // with it failed, submitting would be a proof against nothing.
  const formDisabled = surfaceError || !surface;

  const onSubmit = async (values: z.infer<typeof paymentProofSchema>) => {
    if (!file) {
      setFileError("Attach your transfer receipt before submitting.");
      return;
    }
    try {
      await submit.mutateAsync({
        file,
         amount: Number(values.amount),
        registration: registration === GENERAL ? undefined : registration,
        installment: tranche?.id,
         reference: values.reference.trim() || undefined,
      });
      toast.success("Submitted — we'll confirm your transfer shortly.");
      setDone(true);
      form.reset();
      setTranche(null);
      setRegistration(GENERAL);
      setFile(null);
      setFileError(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      // interceptor toasts
    }
  };

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (isPageLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          variant="editorial"
          divider
          dateline={`${dateline} · Student Accounts`}
          title="Manual Payments & Proofs"
          description="Paid by bank transfer? Upload your receipt and we'll confirm it."
          actions={
            <RefreshButton
              loading={isFetching}
              onClick={() => Promise.allSettled([refetchSurface(), refetchPlans()])}
            />
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        divider
        dateline={`${dateline} · Student Accounts`}
        title="Manual Payments & Proofs"
        description={
          surface && surface.proofs.length > 0 ? (
            <>
              Upload bank transfer receipts for verification. You have{" "}
              <strong className="text-foreground">{surface.proofs.length}</strong> recorded {pluralize(surface.proofs.length, "submission", undefined, false)}.
            </>
          ) : (
            "Paid via bank transfer? Upload your payment receipt and our finance team will verify it."
          )
        }
        actions={
          <RefreshButton
            loading={isFetching}
            onClick={() => Promise.allSettled([refetchSurface(), refetchPlans()])}
          />
        }
      />

      {surfaceError && (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load your payment details"
          description="The bank account and your submissions didn't load, so uploads are paused until they do."
          action={
            <Button variant="outline" size="sm" onClick={() => void refetchSurface()} disabled={surfaceFetching}>
              <RotateCw className="h-3.5 w-3.5" /> Try again
            </Button>
          }
        />
      )}

      {bank && (bank.accountNumber || bank.bankName) && (
        <div className="rounded-2xl border border-border bg-card shadow-sm p-5 md:p-6 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-primary">
              Official Bank Transfer Account
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">Manual Verification</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {bank.bankName && (
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-[11px] text-muted-foreground uppercase font-mono">Bank Name</p>
                <p className="font-semibold text-foreground mt-0.5 text-sm">{bank.bankName}</p>
              </div>
            )}
            {bank.accountName && (
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-[11px] text-muted-foreground uppercase font-mono">Account Name</p>
                <p className="font-semibold text-foreground mt-0.5 text-sm truncate">{bank.accountName}</p>
              </div>
            )}
            {bank.accountNumber && (
              <div className="rounded-xl bg-muted/40 p-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-mono">Account Number</p>
                  <p className="font-mono font-bold text-foreground mt-0.5 text-sm sm:text-base tracking-wider">
                    {bank.accountNumber}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Copy account number"
                  className="rounded-lg hover:bg-muted"
                  onClick={() => void copy(bank.accountNumber)}
                >
                  <Copy className="h-4 w-4 text-primary" />
                </Button>
              </div>
            )}
          </div>
          {bank.paymentInstructions && (
            <p className="text-xs text-muted-foreground bg-muted/20 border border-border/50 p-3 rounded-xl leading-relaxed">
              {bank.paymentInstructions}
            </p>
          )}
        </div>
      )}

      {plansError && (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load your payment schedule"
          description="You can still upload a proof below."
          action={
            <Button variant="outline" size="sm" onClick={() => void refetchPlans()} disabled={plansFetching}>
              <RotateCw className="h-3.5 w-3.5" /> Try again
            </Button>
          }
        />
      )}

      {(plans ?? []).map((plan) => (
        <InstallmentScheduleCard
          key={plan.id}
          plan={plan}
          onPayTranche={payTranche}
        />
      ))}

      <Form {...form}><form
        ref={formRef}
        onSubmit={(event) => {
          void form.handleSubmit(onSubmit)(event);
        }}
        className="space-y-4 rounded-2xl border border-border bg-card shadow-sm p-5 md:p-6"
      >
        <p className="font-display text-base font-semibold text-foreground">Upload a payment proof</p>

        {tranche && (
          <p className="flex items-center justify-between gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
            <span>
              Paying <strong>payment {tranche.sequence}</strong> ·{" "}
              {formatPrice(tranche.amount)}
            </span>
            <Button
              type="button"
              variant="link"
              className="p-0 text-xs"
              onClick={clearTranche}
            >
              Clear
            </Button>
          </p>
        )}

        {surface && surface.registrations.length > 0 && (
          <div className="grid gap-1.5">
            <Label htmlFor="payment-registration">What is this payment for?</Label>
            <Select value={registration} onValueChange={(v) => setRegistration(v ?? GENERAL)} disabled={form.formState.isSubmitting}>
              <SelectTrigger id="payment-registration" className="w-full *:data-[slot=select-value]:normal-case">
                <SelectValue placeholder="General / other">
                  {(v: string) => {
                    if (!v || v === GENERAL) return "General / other";
                    const reg = surface?.registrations.find((r) => r._id === v);
                    if (!reg) return v;
                    return `${reg.courseName}${reg.remainingAmount > 0 ? ` — ${formatPrice(reg.remainingAmount)} outstanding` : ""}`;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GENERAL}>General / other</SelectItem>
                {surface.registrations.map((r) => (
                  <SelectItem key={r._id} value={r._id}>
                    {r.courseName}
                    {r.remainingAmount > 0
                      ? ` — ${formatPrice(r.remainingAmount)} outstanding`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
           <FormField control={form.control} name="amount" render={({ field }) => <FormItem className="grid gap-1.5"><FormLabel>Amount paid (₦)</FormLabel><FormControl><Input type="number" inputMode="numeric" min={1} placeholder="e.g. 50000" className="rounded-xl" disabled={formDisabled || form.formState.isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>} />
           <FormField control={form.control} name="reference" render={({ field }) => <FormItem className="grid gap-1.5"><FormLabel>Transfer reference (optional)</FormLabel><FormControl><Input type="text" placeholder="From your bank app" className="rounded-xl" disabled={formDisabled || form.formState.isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>} />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="proof-file-trigger">Transfer receipt</Label>
          <Button
            id="proof-file-trigger"
            type="button"
            variant="outline"
            aria-describedby={fileError ? "proof-file-error" : undefined}
            aria-invalid={!!fileError || undefined}
            className="h-auto w-full flex-col gap-1 whitespace-normal rounded-2xl border-2 border-dashed p-6 text-center font-normal text-muted-foreground hover:border-primary/50 hover:bg-muted/30"
            onClick={() => fileRef.current?.click()}
            disabled={formDisabled || form.formState.isSubmitting}
          >
            <UploadCloud className="mb-1 h-6 w-6 text-primary" />
            {file ? (
              <span className="font-semibold text-foreground break-all">{file.name}</span>
            ) : (
              <>
                <span className="font-medium text-foreground">Tap to attach your receipt</span>
                <span className="text-xs">Supports PNG, JPG, PDF up to 10MB</span>
              </>
            )}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          {fileError && (
            <p id="proof-file-error" className="text-sm text-destructive">
              {fileError}
            </p>
          )}
        </div>

        {done && (
          <p className="flex items-center gap-1.5 text-sm text-success font-medium">
            <CheckCircle2 className="h-4 w-4" /> Submitted — awaiting confirmation.
          </p>
        )}

        <Button
          type="submit"
          className="rounded-xl bg-primary text-primary-foreground font-semibold px-5"
          disabled={formDisabled || submit.isPending || form.formState.isSubmitting}
        >
          {submit.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
          {submit.isPending ? "Submitting…" : "Submit payment proof"}
        </Button>
      </form></Form>

      {surface && surface.proofs.length > 0 ? (
        <Ledger title="Your submissions" count={surface.proofs.length}>
          {surface.proofs.map((p: MyPaymentProofUi) => {
            const confirmed = p.status === "confirmed";
            const rejected = p.status === "rejected";
            const amount = confirmed
              ? p.confirmedAmount ?? p.amountClaimed
              : p.amountClaimed;

            return (
              <LedgerItem
                key={p._id}
                icon={confirmed ? CheckCircle2 : rejected ? AlertCircle : Clock}
                iconClassName={
                  confirmed
                    ? "bg-success/10 text-success"
                    : rejected
                      ? "bg-destructive/10 text-destructive"
                      : "bg-warning/10 text-warning"
                }
                title={
                  <>
                    {formatPrice(amount)}
                    {p.courseName ? (
                      <span className="font-normal text-muted-foreground">
                        {" · "}
                        {p.courseName}
                      </span>
                    ) : null}
                  </>
                }
                meta={
                  rejected && p.reviewNotes
                    ? p.reviewNotes
                    : p.reference
                      ? `Reference: ${p.reference}`
                      : undefined
                }
                when={
                  p.status === "confirmed"
                    ? "Confirmed"
                    : p.status === "rejected"
                      ? "Declined"
                      : "Pending"
                }
              />
            );
          })}
        </Ledger>
      ) : null}
    </div>
  );
}
