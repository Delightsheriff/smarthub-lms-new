"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Copy, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { useMyInstallmentPlans, useMyPaymentSurface, useSubmitPaymentProof } from "../api/payment-proofs.queries";
import type { MyInstallmentPlanUi, MyPaymentProofUi, PlanTrancheUi } from "../types";
import { InstallmentScheduleCard } from "./InstallmentScheduleCard";

const GENERAL = "general";

const statusTone: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export function PaymentsPageContent() {
  const { data: surface, isLoading } = useMyPaymentSurface();
  const { data: plans } = useMyInstallmentPlans();
  const submit = useSubmitPaymentProof();

  const [amount, setAmount] = useState("");
  const [registration, setRegistration] = useState("general");
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [done, setDone] = useState(false);
  const [tranche, setTranche] = useState<PlanTrancheUi | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const payTranche = (t: PlanTrancheUi, plan: MyInstallmentPlanUi) => {
    setTranche(t);
    setAmount(String(t.amount));
    setDone(false);
    const reg = surface?.registrations.find(
      (r) => r.courseName && plan.courseName && r.courseName === plan.courseName,
    );
    if (reg) setRegistration(reg._id);
    else setRegistration(GENERAL);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const bank = surface?.bank;

  const copy = (v?: string) => {
    if (v) {
      void navigator.clipboard?.writeText(v);
      toast.success("Copied");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter the amount you paid");
      return;
    }
    if (!file) {
      toast.error("Attach your transfer receipt");
      return;
    }
    try {
      await submit.mutateAsync({
        file,
        amount: amt,
        registration: registration === GENERAL ? undefined : registration,
        installment: tranche?.id,
        reference: reference.trim() || undefined,
      });
      toast.success("Submitted — we'll confirm your transfer shortly.");
      setDone(true);
      setAmount("");
      setReference("");
      setTranche(null);
      setRegistration(GENERAL);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      // interceptor toasts
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        variant="editorial"
        eyebrow="Money"
        title="Payments"
        description="Paid by bank transfer? Upload your receipt and we'll confirm it."
      />

      {bank && (bank.accountNumber || bank.bankName) && (
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Transfer to
          </p>
          <div className="space-y-1 text-sm">
            {bank.bankName && (
              <p>
                <span className="text-muted-foreground">Bank:</span>{" "}
                <span className="font-medium">{bank.bankName}</span>
              </p>
            )}
            {bank.accountName && (
              <p>
                <span className="text-muted-foreground">Name:</span>{" "}
                <span className="font-medium">{bank.accountName}</span>
              </p>
            )}
            {bank.accountNumber && (
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground">Account:</span>{" "}
                <span className="font-mono font-semibold">
                  {bank.accountNumber}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Copy account number"
                  onClick={() => copy(bank.accountNumber)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </p>
            )}
          </div>
          {bank.paymentInstructions && (
            <p className="mt-2 text-xs text-muted-foreground">
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

      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="space-y-4 rounded-lg border p-4"
      >
        <p className="text-sm font-semibold">Upload a payment proof</p>

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
            <Select value={registration} onValueChange={(v) => setRegistration(v ?? GENERAL)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="General / other" />
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
          <div className="grid gap-1.5">
            <Label>Amount paid (₦)</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50000"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Transfer reference (optional)</Label>
            <Input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="From your bank app"
            />
          </div>
        </div>

        <Label
          htmlFor="proof-file"
          className="block cursor-pointer rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground hover:border-primary/40"
        >
          <UploadCloud className="mx-auto mb-1 h-5 w-5" />
          {file ? (
            <span className="font-medium text-foreground">{file.name}</span>
          ) : (
            <span>Tap to attach your receipt (image or PDF)</span>
          )}
          <Input
            id="proof-file"
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Label>

        {done && (
          <p className="flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> Submitted — awaiting confirmation.
          </p>
        )}

        <Button type="submit" disabled={submit.isPending}>
          {submit.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {submit.isPending ? "Submitting…" : "Submit payment proof"}
        </Button>
      </form>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : surface && surface.proofs.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-semibold">Your submissions</p>
          <ul className="space-y-2">
            {surface.proofs.map((p: MyPaymentProofUi) => (
              <li
                key={p._id}
                className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {`₦${(
                      p.status === "confirmed"
                        ? p.confirmedAmount ?? p.amountClaimed
                        : p.amountClaimed
                    ).toLocaleString("en-NG")}`}
                    {p.courseName ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {p.courseName}
                      </span>
                    ) : null}
                  </p>
                  {p.status === "rejected" && p.reviewNotes && (
                    <p className="text-xs text-destructive">{p.reviewNotes}</p>
                  )}
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs capitalize ${
                    statusTone[p.status] ??
                    "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
