"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyableEmailProps {
  email?: string | null;
  /** Default rendering wraps the email in a `mailto:` link. Pass
   *  `false` to render plain text (e.g. inside other links / clickable
   *  rows where a nested anchor would break the parent's click). */
  asLink?: boolean;
  className?: string;
  /** Visual size of the copy icon. Default 12 (h-3 w-3). */
  iconSize?: 12 | 14 | 16;
  /** Render nothing when email is missing rather than showing "—". */
  hideWhenEmpty?: boolean;
}

/**
 * Email cell with a copy-to-clipboard icon revealed on hover.
 *
 * Used wherever teaching surfaces list a student's address (submissions,
 * not-submitted, roster).
 */
export function CopyableEmail({
  email,
  asLink = true,
  className,
  iconSize = 12,
  hideWhenEmpty = false,
}: CopyableEmailProps) {
  const [copied, setCopied] = useState(false);

  if (!email) {
    if (hideWhenEmpty) return null;
    return <span className={cn("text-muted-foreground", className)}>—</span>;
  }

  const handleCopy = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Swallowed on insecure context / clipboard permission issue
    }
  };

  const iconClass = cn(
    iconSize === 12 && "h-3 w-3",
    iconSize === 14 && "h-3.5 w-3.5",
    iconSize === 16 && "h-4 w-4",
  );

  const text = asLink ? (
    <a
      href={`mailto:${email}`}
      className="truncate hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {email}
    </a>
  ) : (
    <span className="truncate">{email}</span>
  );

  return (
    <span
      className={cn(
        "group/copy inline-flex items-center gap-1 max-w-full",
        className,
      )}
    >
      {text}
      <button
        type="button"
        onClick={handleCopy}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleCopy(e);
        }}
        aria-label={copied ? "Copied" : `Copy ${email} to clipboard`}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded p-0.5 text-muted-foreground transition-opacity hover:text-foreground",
          copied
            ? "opacity-100 text-success"
            : "opacity-0 group-hover/copy:opacity-100 focus-visible:opacity-100",
        )}
      >
        {copied ? (
          <Check className={cn(iconClass, "text-success")} />
        ) : (
          <Copy className={iconClass} />
        )}
      </button>
    </span>
  );
}
