"use client";
import { NagItem } from "@/components/ui/ledger";
import { formatPrice } from "@/lib/utils";
import { useInternshipPayment } from "../../api/internships.queries";

/**
 * Internship-fee nudge in the dashboard's "Needs a look" ledger.
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
    <NagItem
      tone="due"
      title={`${formatPrice(due)} internship fee outstanding`}
      meta="Internship"
      href="/internships/me/payment"
      cta="Pay →"
    />
  );
}