"use client";
import Link from "next/link";
import { ArrowRight, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useInternshipPayment } from "../../api/internships.queries";

/**
 * Compact internship-fee nudge under the dashboard welcome card.
 * Self-gating: only shows while the intern has a *pending* payment
 * with no proof uploaded yet — settled or waived interns get silence.
 */
export function InternshipPaymentBannerCard() {
  const { data } = useInternshipPayment();

  if (!data || data.paymentStatus === "completed") return null;
  // Proof uploaded → awaiting admin confirmation; stop the nudge.
  if (data.paymentProofUrl) return null;

  const due = data.fee - data.paidAmount;
  if (due <= 0) return null;

  return (
    <Card className="border-warning/30 bg-warning/5 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <ReceiptText className="h-4 w-4" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Internship fee
            </p>
            <p className="text-base font-semibold tabular-nums">
              {formatPrice(due)} outstanding
            </p>
          </div>
        </div>
        <Button
          render={<Link href="/internships/me/payment" />}
          size="sm"
          variant="outline"
          className="shrink-0"
        >
          Pay fee <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}