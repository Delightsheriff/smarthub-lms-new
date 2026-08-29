"use client";
import {
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Receipt,
  Tag,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
 * Per-registration card: course meta, payment posture, history.
 * One card per Registration row the student has on the platform.
 */
export function RegistrationBillingCard({ registration: r }: Props) {
  const statusTone = STATUS_TONE[r.paymentStatus] || "border-border text-muted-foreground";
  const statusLabel = STATUS_LABEL[r.paymentStatus] || r.paymentStatus;
  // A waiver covers everything from the student's perspective — they
  // owe nothing and have full access. Treat it the same as paid-in-
  // full so the "Remaining / progress bar / instalment plan" UI
  // stops nagging them about a balance they aren't expected to clear.
  const isWaived = r.paymentStatus === "waived";
  const fullyPaid =
    isWaived || (r.remainingAmount <= 0 && r.totalAmount > 0);

  // Presence (> 0) toggles every discount-related bit of UI. The
  // API only sends these fields when an admin has actually applied
  // one, so this check stays clean across fresh / legacy rows.
  const hasDiscount = !!r.discountAmount && r.discountAmount > 0;
  const discountLabel =
    r.discountKind === "percent" && typeof r.discountValue === "number"
      ? `${r.discountValue}% off`
      : hasDiscount
        ? `${formatPrice(r.discountAmount!)} off`
        : "";
  const reasonLabel = formatReason(r.discountReason);

  return (
    <Card className="space-y-5 p-5 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <Badge variant="secondary" className="mb-1">
            <GraduationCap className="mr-1 h-3 w-3" />
            {r.courseMode || "course"}
          </Badge>
          <h3 className="truncate text-lg font-semibold leading-tight">
            {r.courseName}
          </h3>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {r.cohortLabel}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant="outline" className={cn(statusTone)}>
            {fullyPaid && <CheckCircle2 className="mr-1 h-3 w-3" />}
            {statusLabel}
          </Badge>
          {hasDiscount && (
            <Badge
              variant="default"
              className="border-accent/30 bg-accent/15 text-accent"
            >
              <Tag className="mr-1 h-3 w-3" />
              {reasonLabel}
              {discountLabel ? ` · ${discountLabel}` : ""}
            </Badge>
          )}
        </div>
      </header>

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
        <p className="-mt-2 text-xs text-muted-foreground">
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

      <div className="space-y-2">
        <h4 className="inline-flex items-center gap-1.5 text-sm font-semibold">
          <Receipt className="h-3.5 w-3.5" />
          Payment history
          <span className="text-xs font-normal text-muted-foreground">
            ({r.payments.length})
          </span>
        </h4>
        {r.payments.length === 0 ? (
          <p className="py-2 text-xs text-muted-foreground">
            No payments recorded yet.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {r.payments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5"
              >
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDate(p.paidAt, "long")}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {formatPrice(p.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
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
