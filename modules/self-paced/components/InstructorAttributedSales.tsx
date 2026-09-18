"use client";
import { useState } from "react";
import { Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pager } from "@/components/ui/pager";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, pluralize } from "@/lib/utils";
import {
  ORDERS_PAGE_SIZE,
  useMyAttributedOrders,
} from "../api/instructor.queries";
import { formatMinor } from "../lib/format";

/**
 * Orders bought through the instructor's referral links, newest first.
 * The API reduces each buyer to a first name — this explains the sales,
 * it doesn't hand over the buyers. Refunded orders stay listed (struck
 * through) so a clawback on the Earnings tab has a visible cause.
 */
export function InstructorAttributedSales() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useMyAttributedOrders(page);

  if (isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;

  if (error) {
    return (
      <Card className="p-6 text-center space-y-3 border-destructive/20 bg-destructive/5">
        <p className="font-semibold">We couldn&apos;t load your sales</p>
        <Button size="sm" onClick={() => void refetch()}>
          Try again
        </Button>
      </Card>
    );
  }

  const orders = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(
    1,
    Math.ceil(total / (data?.meta.limit || ORDERS_PAGE_SIZE))
  );

  if (orders.length === 0) {
    return (
      <Card className="p-10 text-center">
        <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="font-semibold">No sales through your links yet</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          When someone buys a course through one of your referral links,
          the sale shows up here.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 sm:px-6">Course</th>
                <th className="px-5 py-3 sm:px-6">Buyer</th>
                <th className="px-5 py-3 sm:px-6">Date</th>
                <th className="px-5 py-3 text-right sm:px-6">Amount</th>
                <th className="px-5 py-3 sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {orders.map((o) => {
                const refunded = o.status === "refunded";
                return (
                  <tr key={o._id}>
                    <td className="px-5 py-3 sm:px-6">
                      <span className="block font-medium text-foreground">
                        {o.itemName}
                      </span>
                      <span className="block text-xs text-muted-foreground font-mono">
                        {o.reference}
                        {o.referralCode ? ` · ${o.referralCode}` : ""}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground sm:px-6">
                      {o.buyerFirstName || "—"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap sm:px-6">
                      {formatDate(o.paidAt)}
                    </td>
                    <td
                      className={
                        "px-5 py-3 text-right tabular-nums sm:px-6 " +
                        (refunded
                          ? "text-muted-foreground line-through"
                          : "text-foreground")
                      }
                    >
                      {formatMinor(o.amountMinor, o.currency)}
                    </td>
                    <td className="px-5 py-3 sm:px-6">
                      {refunded ? (
                        <Badge variant="secondary">
                          Refunded
                          {o.refundedAt ? ` ${formatDate(o.refundedAt)}` : ""}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-success/30 text-success bg-success/10"
                        >
                          Paid
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Pager
        page={page}
        totalPages={totalPages}
        onPage={setPage}
        label={pluralize(total, "sale")}
      />
    </div>
  );
}
