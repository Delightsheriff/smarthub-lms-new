"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Landmark } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { timeAgo } from "@/lib/utils"
import {
  useMyBankingDetails,
  useUpdateMyBankingDetails,
} from "../api/profile.queries"
import type { BankingDetails, BankingDetailsPatch } from "../types"

const bankingSchema = z.object({
  bankName: z
    .string()
    .trim()
    .max(100, "Bank name must be 100 characters or fewer"),
  accountName: z
    .string()
    .trim()
    .max(100, "Account name must be 100 characters or fewer"),
  accountNumber: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || value.length >= 4,
      "Account number must be at least 4 characters"
    ),
  payoutEmail: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || z.email().safeParse(value).success,
      "Enter a valid payout email"
    ),
})

/**
 * Profile-owned banking sub-doc editor. Sends a dirty-diff PATCH; account
 * number must be ≥4 chars when present (NUBAN is 10). Also feeds referral
 * and instructor-earnings payouts, hence the header copy.
 *
 * The form lives in its own component remounted via `key` whenever the
 * fetched details change, so local state is freshly seeded without any
 * setState-in-effect.
 */
export function BankingTab() {
  const { data, isLoading } = useMyBankingDetails()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Landmark className="h-4 w-4" /> Banking details
        </CardTitle>
        <CardDescription>
          Used to pay out referral earnings and instructor pay.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <BankingForm key={data?.updatedAt ?? "empty"} data={data ?? {}} />
        )}
      </CardContent>
    </Card>
  )
}

function BankingForm({ data }: { data: BankingDetails }) {
  const update = useUpdateMyBankingDetails()
  type Values = z.infer<typeof bankingSchema>
  const form = useForm<Values>({
    resolver: zodResolver(bankingSchema),
    defaultValues: {
      bankName: data.bankName ?? "",
      accountName: data.accountName ?? "",
      accountNumber: data.accountNumber ?? "",
      payoutEmail: data.payoutEmail ?? "",
    },
  })
  const watched = useWatch({ control: form.control })
  const values: Values = {
    bankName: watched.bankName ?? "",
    accountName: watched.accountName ?? "",
    accountNumber: watched.accountNumber ?? "",
    payoutEmail: watched.payoutEmail ?? "",
  }

  const dirty: BankingDetailsPatch = {
    ...(values.bankName.trim() !== (data.bankName ?? "") && {
      bankName: values.bankName.trim(),
    }),
    ...(values.accountName.trim() !== (data.accountName ?? "") && {
      accountName: values.accountName.trim(),
    }),
    ...(values.accountNumber.trim() !== (data.accountNumber ?? "") && {
      accountNumber: values.accountNumber.trim(),
    }),
    ...(values.payoutEmail.trim() !== (data.payoutEmail ?? "") && {
      payoutEmail: values.payoutEmail.trim(),
    }),
  }
  const hasChanges = Object.keys(dirty).length > 0

  const submit = async (submitted: Values) => {
    const patch: BankingDetailsPatch = {
      ...(submitted.bankName !== (data.bankName ?? "") && {
        bankName: submitted.bankName,
      }),
      ...(submitted.accountName !== (data.accountName ?? "") && {
        accountName: submitted.accountName,
      }),
      ...(submitted.accountNumber !== (data.accountNumber ?? "") && {
        accountNumber: submitted.accountNumber,
      }),
      ...(submitted.payoutEmail !== (data.payoutEmail ?? "") && {
        payoutEmail: submitted.payoutEmail,
      }),
    }
    if (!Object.keys(patch).length) return
    try {
      await update.mutateAsync(patch)
      toast.success("Banking details saved.")
      form.reset(submitted)
    } catch {
      /* interceptor toasts */
    }
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
      <div className="grid gap-1.5">
        <Label htmlFor="bank-name">Bank name</Label>
        <Input
          id="bank-name"
          disabled={form.formState.isSubmitting}
          {...form.register("bankName")}
          placeholder="e.g. GTBank"
        />
        {form.formState.errors.bankName ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.bankName.message}
          </p>
        ) : null}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="account-name">Account name</Label>
        <Input
          id="account-name"
          disabled={form.formState.isSubmitting}
          {...form.register("accountName")}
          placeholder="Account holder name"
        />
        {form.formState.errors.accountName ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.accountName.message}
          </p>
        ) : null}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="account-number">Account number</Label>
        <Input
          id="account-number"
          disabled={form.formState.isSubmitting}
          {...form.register("accountNumber")}
          placeholder="10-digit account number"
          inputMode="numeric"
        />
        {form.formState.errors.accountNumber ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.accountNumber.message}
          </p>
        ) : null}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="payout-email">Payout email</Label>
        <Input
          id="payout-email"
          type="email"
          disabled={form.formState.isSubmitting}
          {...form.register("payoutEmail")}
          placeholder="you@example.com"
        />
        {form.formState.errors.payoutEmail ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.payoutEmail.message}
          </p>
        ) : null}
      </div>
      {data.updatedAt ? (
        <p className="text-xs text-muted-foreground">
          Last updated {timeAgo(data.updatedAt)}
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!hasChanges || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Saving…" : "Save banking details"}
        </Button>
      </div>
    </form>
  )
}
