"use client";
import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  GraduationCap,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Ledger, LedgerItem } from "@/components/ui/ledger";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import type { BillingRegistrationCard, PaymentStatus } from "../types";

/** Curated reason → friendly label. Falls back to a title-cased
 *  version of whatever the API sent, so a new reason value never
 *  breaks the render. */
const DISCOUNT_REASON_LABEL: Record<string, string> = {
  scholarship: "Scholarship",
  "tech-scholars-full": "Full Scholarship",
  "tech-scholars-partial": "Partial Scholarship",
  "tech-scholars-standard": "Scholarship",
  "returning-student": "Returning student",
  referral: "Referral",
  promo: "Promo",
  hardship: "Hardship",
  "group-rate": "Group rate",
  staff: "Staff rate",
  other: "Discount",
};

const formatReason = (reason?: string): string => {
  if (!reason) return "Discount";
  if (DISCOUNT_REASON_LABEL[reason]) return DISCOUNT_REASON_LABEL[reason];
  return reason
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

interface Props {
  registration: BillingRegistrationCard;
}

/** Tone classes layered over an `outline` badge. The allowed badge
 *  variants only cover default/secondary/destructive/outline/ghost/link,
 *  so status colour is expressed via explicit utility classes. */
const STATUS_TONE: Record<PaymentStatus, string> = {
  pending: "border-warning/40 text-warning",
  completed: "border-success/40 bg-success/10 text-success",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
  refunded: "border-border text-muted-foreground",
  waived: "border-success/40 bg-success/10 text-success",
};

const STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "In progress",
  completed: "Paid in full",
  cancelled: "Cancelled",
  refunded: "Refunded",
  waived: "Waived",
};

/**
 * Per-registration row in the billing IndexList — expandable inline
 * to reveal the stats and payment history Ledger. No separate detail
 * view exists, so the row expands in place.
 */
export function RegistrationBillingCard({ registration: r }: Props) {
  const [expanded, setExpanded] = useState(false);
  const statusTone = STATUS_TONE[r.paymentStatus] || "border-border text-muted-foreground";
  const statusLabel = STATUS_LABEL[r.paymentStatus] || r.paymentStatus;
  const isWaived = r.paymentStatus === "waived";
  const fullyPaid =
    isWaived || (r.remainingAmount <= 0 && r.totalAmount > 0);
  const hasDiscount = !!r.discountAmount && r.discountAmount > 0;
  const discountLabel =
    r.discountKind === "percent" && typeof r.discountValue === "number"
      ? `${r.discountValue}% off`
      : hasDiscount
        ? `${formatPrice(r.discountAmount!)} off`
        : "";
  const reasonLabel = formatReason(r.discountReason);

  return (
    <div className="border-b border-border">
      {/* IndexList-style row header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-4 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        {/* Mode badge as narrow icon */}
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <GraduationCap className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-semibold text-sm text-foreground truncate">
              {r.courseName}
            </span>
            <Badge variant="outline" className={cn("text-[10px]", statusTone)}>
              {fullyPaid && <CheckCircle2 className="mr-1 h-3 w-3" />}
              {statusLabel}
            </Badge>
            {hasDiscount && (
              <Badge variant="default" className="border-accent/30 bg-accent/15 text-accent text-[10px]">
                <Tag className="mr-1 h-3 w-3" />
                {reasonLabel}{discountLabel ? ` · ${discountLabel}` : ""}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{r.cohortLabel}</span>
            <span className="font-mono">·</span>
            <span>{formatPrice(r.paidAmount)} paid</span>
            {!fullyPaid && r.remainingAmount > 0 && (
              <>
                <span className="font-mono">·</span>
                <span className="text-warning font-medium">{formatPrice(r.remainingAmount)} remaining</span>
              </>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        {!fullyPaid && (
          <span className="hidden sm:block font-mono text-[10px] tabular-nums text-muted-foreground shrink-0">
            {r.paymentProgress}%
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="pb-5 space-y-4">
          {/* Stats row */}
          <div className="grid gap-3 text-xs sm:grid-cols-3">
            <Stat
              label="Total quoted"
              value={formatPrice(r.totalAmount)}
              struckThrough={
                hasDiscount && r.coursePrice && r.coursePrice > r.totalAmount
                  ? formatPrice(r.coursePrice)
                  : undefined
              }
            />
            <Stat
              label="Paid"
              value={formatPrice(r.paidAmount)}
              tone={fullyPaid ? "success" : undefined}
            />
            <Stat
              label="Remaining"
              value={isWaived ? formatPrice(0) : formatPrice(r.remainingAmount)}
              tone={
                isWaived
                  ? "success"
                  : r.remainingAmount > 0
                    ? "warning"
                    : undefined
              }
            />
          </div>

          {hasDiscount && r.discountNote && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Note:</span>{" "}
              {r.discountNote}
            </p>
          )}

          {!fullyPaid && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Plan:{" "}
                  {r.paymentOption === "installment" ? "Instalments" : "One-time"}
                </span>
                <span className="font-bold tabular-nums">{r.paymentProgress}%</span>
              </div>
              <Progress value={r.paymentProgress} />
            </div>
          )}

          {/* Payment history as Ledger */}
          <Ledger
            title="Payment history"
            count={r.payments.length}
            empty="No payments recorded yet."
          >
            {r.payments.map((p) => (
              <LedgerItem
                key={p.id}
                icon={Clock}
                iconClassName="bg-muted text-muted-foreground"
                title={formatPrice(p.amount)}
                when={formatDate(p.paidAt, "long")}
              />
            ))}
          </Ledger>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  struckThrough,
}: {
  label: string;
  value: string;
  tone?: "warning" | "success";
  struckThrough?: string;
}) {
  const valueClass =
    tone === "warning"
      ? "text-warning"
      : tone === "success"
        ? "text-success"
        : "text-foreground";
  return (
    <div className="rounded-xl border bg-card p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {struckThrough && (
        <p className="text-[11px] text-muted-foreground line-through tabular-nums">
          {struckThrough}
        </p>
      )}
      <p className={cn("text-sm font-semibold tabular-nums", valueClass)}>
        {value}
      </p>
    </div>
  );
}
