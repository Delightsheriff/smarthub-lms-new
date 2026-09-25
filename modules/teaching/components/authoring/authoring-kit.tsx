"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * Shared scaffolding for the instructor authoring forms (assignment,
 * material, recording). Operator surfaces, so the header stays on the
 * default (sans) PageHeader; sections are separated by hairlines in a
 * single reading column rather than boxed in cards.
 */

export function AuthoringShell({
  backHref,
  backLabel,
  title,
  description,
  children,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        {backLabel}
      </Link>
      <PageHeader title={title} description={description} />
      {children}
    </div>
  );
}

export function AuthoringSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6" aria-busy="true">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

/** Load failure for the thing the form depends on (cohort / record). */
export function AuthoringLoadError({
  message,
  backHref,
  onRetry,
}: {
  message: string;
  backHref: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 border-t border-border pt-6">
      <p className="flex items-start gap-2 text-sm text-destructive" role="alert">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        {message}
      </p>
      <div className="flex gap-2">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={backHref} />}
        >
          Go back
        </Button>
      </div>
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-5 border-t border-border pt-6", className)}>
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  const hintId = id && hint ? `${id}-hint` : undefined;
  const errorId = id && error ? `${id}-error` : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export interface Option {
  value: string;
  label: string;
}

/** `Select` over a fixed option list, rendering the option's label (not
 *  its raw value — module ids would otherwise show in the trigger). */
export function OptionSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  invalid,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
  invalid?: boolean;
}) {
  return (
    <Select
      value={value || null}
      onValueChange={(v) => onChange((v as string | null) ?? "")}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className="w-full rounded-xl"
        aria-invalid={invalid || undefined}
      >
        <SelectValue placeholder={placeholder} className="normal-case">
          {(v: string | null) =>
            options.find((o) => o.value === v)?.label ?? placeholder
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="normal-case">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** A labelled on/off setting — label + explanation left, switch right. */
export function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={(c) => onCheckedChange(!!c)}
        disabled={disabled}
      />
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

export function FormActions({
  cancelHref,
  submitting,
  disabled,
  submitLabel,
}: {
  cancelHref: string;
  submitting: boolean;
  disabled?: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end">
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={cancelHref} />}
        aria-disabled={submitting || undefined}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={submitting || disabled}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {submitLabel}
      </Button>
    </div>
  );
}

/** TipTap stores an empty editor as `<p></p>`; treat tag-only HTML as empty. */
export function isRichTextEmpty(html: string | undefined): boolean {
  if (!html) return true;
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim().length === 0;
}

/** Module picker options, numbered by course order: "01 · Intro". */
export function moduleOptions(
  modules: { id: string; title: string; order?: number }[],
): Option[] {
  return modules.map((m) => ({
    value: m.id,
    label: `${String(m.order ?? 0).padStart(2, "0")} · ${m.title}`,
  }));
}

/** Confirm step for detach / delete. Stays open while pending so a
 *  failure (toasted by the API client) leaves the choice in front of
 *  the instructor. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pending,
  onConfirm,
  destructive = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pending: boolean;
  onConfirm: () => void;
  destructive?: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? "destructive" : "default"}
            disabled={pending}
            onClick={onConfirm}
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
