"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Clock, Copy, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useMyInstallmentPlans, useMyPaymentSurface, useSubmitPaymentProof } from "../api/payment-proofs.queries";
import type { MyInstallmentPlanUi, MyPaymentProofUi, PlanTrancheUi } from "../types";
import { InstallmentScheduleCard } from "./InstallmentScheduleCard";

const GENERAL = "general";
const paymentProofSchema = z.object({
  amount: z.string().trim().refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, "Enter an amount greater than zero"),
  reference: z.string().max(500, "Reference must be 500 characters or fewer"),
});

export function PaymentsPageContent() {
  const {
    data: surface,
    isLoading: surfaceLoading,
    isFetching: surfaceFetching,
    refetch: refetchSurface,
  } = useMyPaymentSurface();
  const {
    data: plans,
    isLoading: plansLoading,
    isFetching: plansFetching,
    refetch: refetchPlans,
  } = useMyInstallmentPlans();
  const submit = useSubmitPaymentProof();

  const isPageLoading = surfaceLoading || plansLoading;
  const isFetching = surfaceFetching || plansFetching;

  const [registration, setRegistration] = useState("general");
  const [file, setFile] = useState<File | null>(null);
  const [done, setDone] = useState(false);
  const [tranche, setTranche] = useState<PlanTrancheUi | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
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
  };

  const bank = surface?.bank;

  const copy = (v?: string) => {
    if (v) {
      void navigator.clipboard?.writeText(v);
      toast.success("Copied");
    }
  };

  const onSubmit = async (values: z.infer<typeof paymentProofSchema>) => {
    if (!file) {
      form.setError("amount", { message: "Attach your transfer receipt before submitting" });
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
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      // interceptor toasts
    }
  };

  const dateline = new Date().toLocaleDateString(undefined, {
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
              <strong className="text-foreground">{surface.proofs.length}</strong> recorded submission{surface.proofs.length === 1 ? "" : "s"}.
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
                  onClick={() => copy(bank.accountNumber)}
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

      {(plans ?? []).map((plan) => (
        <InstallmentScheduleCard
          key={plan.id}
          plan={plan}
          onPayTranche={payTranche}
        />
      ))}

      <Form {...form}><form
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
              {`₦${tranche.amount.toLocaleString("en-NG")}`}
            </span>
            <Button
              type="button"
              variant="link"
              className="p-0 text-xs"
              onClick={() => setTranche(null)}
            >
              Clear
            </Button>
          </p>
        )}

        {surface && surface.registrations.length > 0 && (
          <div className="grid gap-1.5">
             <Label>What is this payment for?</Label>
             <Select value={registration} onValueChange={(v) => setRegistration(v ?? GENERAL)} disabled={form.formState.isSubmitting}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="General / other">
                  {(v: string) => {
                    if (!v || v === GENERAL) return "General / other";
                    const reg = surface?.registrations.find((r) => r._id === v);
                    if (!reg) return v;
                    return `${reg.courseName}${reg.remainingAmount > 0 ? ` — ₦${reg.remainingAmount.toLocaleString("en-NG")} outstanding` : ""}`;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GENERAL}>General / other</SelectItem>
                {surface.registrations.map((r) => (
                  <SelectItem key={r._id} value={r._id}>
                    {r.courseName}
                    {r.remainingAmount > 0
                      ? ` — ₦${r.remainingAmount.toLocaleString("en-NG")} outstanding`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
           <FormField control={form.control} name="amount" render={({ field }) => <FormItem className="grid gap-1.5"><FormLabel>Amount paid (₦)</FormLabel><FormControl><Input type="number" inputMode="numeric" min={1} placeholder="e.g. 50000" className="rounded-xl" disabled={form.formState.isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>} />
           <FormField control={form.control} name="reference" render={({ field }) => <FormItem className="grid gap-1.5"><FormLabel>Transfer reference (optional)</FormLabel><FormControl><Input type="text" placeholder="From your bank app" className="rounded-xl" disabled={form.formState.isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>} />
        </div>

        <Label
          htmlFor="proof-file"
          className="block cursor-pointer rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground hover:border-primary/50 hover:bg-muted/30 transition-all"
        >
          <UploadCloud className="mx-auto mb-2 h-6 w-6 text-primary" />
          {file ? (
            <span className="font-semibold text-foreground">{file.name}</span>
          ) : (
            <div>
              <p className="font-medium text-foreground">Tap to attach your receipt</p>
              <p className="text-xs text-muted-foreground mt-0.5">Supports PNG, JPG, PDF up to 10MB</p>
            </div>
          )}
          <Input
            id="proof-file"
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={form.formState.isSubmitting}
          />
        </Label>

        {done && (
          <p className="flex items-center gap-1.5 text-sm text-success font-medium">
            <CheckCircle2 className="h-4 w-4" /> Submitted — awaiting confirmation.
          </p>
        )}

        <Button
          type="submit"
          className="rounded-xl bg-primary text-primary-foreground font-semibold px-5"
          disabled={submit.isPending || form.formState.isSubmitting}
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
                    {`₦${amount.toLocaleString("en-NG")}`}
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
