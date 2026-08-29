"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { timeAgo } from "@/lib/utils";
import { useMyBankingDetails, useUpdateMyBankingDetails } from "../api/profile.queries";
import type { BankingDetails, BankingDetailsPatch } from "../types";

/**
 * Profile-owned banking sub-doc editor. Sends a dirty-diff PATCH; account
 * number must be ≥4 chars when present (NUBAN is 10).
 *
 * The form lives in its own component remounted via `key` whenever the
 * fetched details change, so local state is freshly seeded without any
 * setState-in-effect.
 */
export function BankingTab() {
  const { data, isLoading } = useMyBankingDetails();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading banking details…</p>;
  }

  return (
    <BankingForm
      key={data?.updatedAt ?? "empty"}
      data={data ?? {}}
    />
  );
}

function BankingForm({ data }: { data: BankingDetails }) {
  const update = useUpdateMyBankingDetails();
  const [bankName, setBankName] = useState(data.bankName ?? "");
  const [accountName, setAccountName] = useState(data.accountName ?? "");
  const [accountNumber, setAccountNumber] = useState(data.accountNumber ?? "");
  const [payoutEmail, setPayoutEmail] = useState(data.payoutEmail ?? "");

  const dirty: BankingDetailsPatch = {
    ...(bankName.trim() !== (data.bankName ?? "") && { bankName: bankName.trim() }),
    ...(accountName.trim() !== (data.accountName ?? "") && { accountName: accountName.trim() }),
    ...(accountNumber.trim() !== (data.accountNumber ?? "") && { accountNumber: accountNumber.trim() }),
    ...(payoutEmail.trim() !== (data.payoutEmail ?? "") && { payoutEmail: payoutEmail.trim() }),
  };
  const hasChanges = Object.keys(dirty).length > 0;
  const invalidAccount =
    accountNumber.trim().length > 0 && accountNumber.trim().length < 4;

  const submit = async () => {
    if (invalidAccount) {
      toast.error("Account number must be at least 4 characters.");
      return;
    }
    try {
      await update.mutateAsync(dirty);
      toast.success("Banking details saved.");
    } catch {
      /* interceptor toasts */
    }
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="bank-name">Bank name</Label>
        <Input
          id="bank-name"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="e.g. GTBank"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="account-name">Account name</Label>
        <Input
          id="account-name"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Account holder name"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="account-number">Account number</Label>
        <Input
          id="account-number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="10-digit account number"
          inputMode="numeric"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="payout-email">Payout email</Label>
        <Input
          id="payout-email"
          type="email"
          value={payoutEmail}
          onChange={(e) => setPayoutEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      {data.updatedAt ? (
        <p className="text-xs text-muted-foreground">
          Last updated {timeAgo(data.updatedAt)}
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={!hasChanges || update.isPending || invalidAccount}>
          {update.isPending ? "Saving…" : "Save banking details"}
        </Button>
      </div>
    </form>
  );
}
