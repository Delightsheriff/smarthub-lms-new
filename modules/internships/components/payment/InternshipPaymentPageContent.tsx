"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  Landmark,
  Loader2,
  ReceiptText,
  RotateCw,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Ledger, LedgerItem } from "@/components/ui/ledger";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatFileSize, formatPrice, RAW_MAX_BYTES } from "@/lib/utils";
import {
  useInternshipPayment,
  useSubmitInternshipPaymentProof,
} from "../../api/internships.queries";

/** `/internships/me/payment` — the internship fee surface. Self-gating
 *  like the dashboard tiles: no applicable payment renders an empty
 *  state, a confirmed payment shows the receipt strip. */
export function InternshipPaymentPageContent() {
  const { data, isLoading, isError, isFetching, refetch } = useInternshipPayment();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Couldn't load your internship payment"
        description="Check your connection and try again."
        action={
          <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <RotateCw className="h-4 w-4" /> Try again
          </Button>
        }
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="No internship payment"
        description="Your internship is fully covered or you have no active placement — there's nothing to pay for right now."
        action={
          <Button variant="outline" nativeButton={false} render={<Link href="/internships" />}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to internship
          </Button>
        }
      />
    );
  }

  const settled = data.paymentStatus === "completed";
  const dateline = settled
    ? `${formatPrice(data.fee)} · Settled in full`
    : `${formatPrice(data.fee - data.paidAmount)} Outstanding`;

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        eyebrow="Internship"
        title="Internship fee"
        dateline={dateline}
        divider
        description={
          settled
            ? "Your internship fee is paid in full. Your placement credentials are fully confirmed."
            : "Complete your transfer and upload proof to keep your placement active."
        }
        actions={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/internships" />} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to internship
          </Button>
        }
      />

      {settled ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-base font-semibold text-foreground">
                Payment settled in full
              </p>
              <p className="text-xs text-muted-foreground">
                Your placement credentials and workspace access are active.
              </p>
            </div>
          </div>

          <Ledger title="Submission history" count={1}>
            <LedgerItem
              icon={CheckCircle2}
              iconClassName="bg-success/10 text-success"
              title={`${formatPrice(data.fee)} · Internship placement fee`}
              meta={
                <>
                  Reference: <span className="font-mono">{data.paymentReference || "—"}</span>
                  {data.paymentConfirmedAt && ` · Confirmed ${formatDate(data.paymentConfirmedAt)}`}
                </>
              }
              when="Paid"
            />
          </Ledger>
        </div>
      ) : data.paymentProofUrl ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning">
              <Clock3 className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-base font-semibold text-foreground">
                Proof submitted — awaiting confirmation
              </p>
              <p className="text-xs text-muted-foreground">
                Finance reviews submissions daily. Your placement updates automatically once confirmed.
              </p>
            </div>
          </div>

          <Ledger title="Your submissions" count={1}>
            <LedgerItem
              tone="due"
              icon={Clock3}
              iconClassName="bg-warning/10 text-warning"
              title={`${formatPrice(data.fee - data.paidAmount)} · Internship placement fee`}
              meta={
                <>
                  Reference: <span className="font-mono">{data.paymentReference || "—"}</span>
                  {data.paymentProofSubmittedAt && ` · Submitted ${formatDate(data.paymentProofSubmittedAt)}`}
                </>
              }
              when="In review"
            />
          </Ledger>

          <BankDetailsCard
            bank={data.bank}
            fee={data.fee}
            outstanding={data.fee - data.paidAmount}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <BankDetailsCard
            bank={data.bank}
            fee={data.fee}
            outstanding={data.fee - data.paidAmount}
          />

          <PendingPaymentAction
            fee={data.fee}
            outstanding={data.fee - data.paidAmount}
          />
        </div>
      )}
    </div>
  );
}

function BankDetailsCard({
  bank,
  fee,
  outstanding,
}: {
  bank?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    paymentInstructions?: string;
  };
  fee: number;
  outstanding: number;
}) {
  if (!bank || !bank.bankName) return null;

  const copy = async (v?: string) => {
    if (!v) return;
    try {
      await navigator.clipboard.writeText(v);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy — select the number and copy it manually.");
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-border pb-3 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-base font-semibold text-foreground">
            Bank transfer details
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pay to our official account, then upload your receipt below
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:self-auto">
          <Landmark className="h-3.5 w-3.5" />
          <span>{bank.bankName}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
            Account name
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {bank.accountName}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
            Account number
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="font-mono text-base font-bold tracking-wider text-foreground">
              {bank.accountNumber}
            </span>
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
        </div>
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
            {outstanding < fee ? "Remaining balance" : "Internship fee"}
          </p>
          <p className="mt-0.5 font-display text-base font-bold text-foreground">
            {formatPrice(outstanding)}
          </p>
        </div>
      </div>

      {bank.paymentInstructions && (
        <p className="rounded-xl border border-border/50 bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
          {bank.paymentInstructions}
        </p>
      )}
    </div>
  );
}

function PendingPaymentAction({
  fee: _fee,
  outstanding: _outstanding,
}: {
  fee: number;
  outstanding: number;
}) {
  const [open, setOpen] = useState(false);
  const mutation = useSubmitInternshipPaymentProof();

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center md:p-6">
        <div>
          <p className="font-display text-base font-semibold text-foreground">
            Ready to confirm your payment?
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Upload your bank transfer receipt (screenshot or PDF) to activate your placement.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0 rounded-xl">
          <UploadCloud className="mr-1.5 h-4 w-4" />
          Upload payment proof
        </Button>
      </div>

      <UploadProofDialog
        open={open}
        onOpenChange={setOpen}
        pending={mutation.isPending}
        onSubmit={async (input) => {
          await mutation.mutateAsync(input);
          setOpen(false);
        }}
      />
    </>
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
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const form = useForm<{ reference: string }>({
    resolver: zodResolver(z.object({ reference: z.string().max(500, "Reference must be 500 characters or fewer") })),
    defaultValues: { reference: "" },
  });

  const pickFile = (next: File | null) => {
    if (fileRef.current) fileRef.current.value = "";
    if (!next) return;
    let error: string | null = null;
    if (!/^image\//.test(next.type) && next.type !== "application/pdf") {
      error = "Attach an image or a PDF.";
    } else if (next.size > RAW_MAX_BYTES) {
      error = `This file is ${formatFileSize(next.size)} — receipts must be 10 MB or smaller.`;
    }
    setFileError(error);
    setFile(error ? null : next);
  };

  const submit = async ({ reference }: { reference: string }) => {
    if (!file) {
      setFileError("Attach your transfer receipt first.");
      return;
    }
    try {
      await onSubmit({ file, reference: reference.trim() || undefined });
      setFile(null);
      setFileError(null);
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
          <div className="grid gap-1.5">
            <Label htmlFor="internship-proof-trigger">Transfer receipt</Label>
            <Button
              id="internship-proof-trigger"
              type="button"
              variant="outline"
              aria-describedby={fileError ? "internship-proof-error" : undefined}
              aria-invalid={!!fileError || undefined}
              className="h-auto w-full flex-col gap-1 whitespace-normal border-dashed p-4 text-center font-normal text-muted-foreground hover:border-primary/40"
              onClick={() => fileRef.current?.click()}
              disabled={pending || form.formState.isSubmitting}
            >
              <UploadCloud className="h-5 w-5" />
              {file ? (
                <span className="font-medium text-foreground break-all">{file.name}</span>
              ) : (
                <span>Tap to attach your receipt (image or PDF, up to 10MB)</span>
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
              <p id="internship-proof-error" className="text-sm text-destructive">
                {fileError}
              </p>
            )}
          </div>
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
