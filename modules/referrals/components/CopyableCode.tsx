"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Click-to-copy pill for the raw referral code. Icon flips to a
 * checkmark for a beat after copy so the user gets in-place feedback
 * regardless of whether the toast is visible (mobile keyboards, etc.).
 *
 * Distinct from `ProgramShareLink`, which copies a full URL. This one
 * copies just the code — useful when the recipient is going to paste
 * it into a referral-code form field rather than open a link.
 */
interface Props {
  code: string | null | undefined;
}

export function CopyableCode({ code }: Props) {
  const [copied, setCopied] = useState(false);

  if (!code) {
    return (
      <div className="inline-flex items-center rounded-md border border-input bg-muted px-3 py-2 font-mono text-base font-semibold text-muted-foreground">
        —
      </div>
    );
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy. Please copy manually.");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onCopy}
      title="Click to copy"
      className="inline-flex items-center gap-2 h-auto px-3 py-2 font-mono text-base font-semibold text-primary"
    >
      <span>{code}</span>
      {copied ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
}