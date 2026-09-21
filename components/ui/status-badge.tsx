import type { LucideIcon } from "lucide-react";
import { Badge } from "./badge";
import { resolveStatus, type StatusTone } from "@/lib/utils";

const TONE_TO_VARIANT: Record<StatusTone, "success" | "warning" | "destructive" | "outline"> = {
  success: "success",
  warning: "warning",
  destructive: "destructive",
  neutral: "outline",
};

/**
 * A `Badge` that resolves its color from a semantic status string (via the
 * shared registry in `lib/utils/status.ts`) instead of each call site
 * picking a variant and writing its own label. Unknown statuses still
 * render — as a neutral badge showing the raw string — so this is safe to
 * drop in anywhere a status pill is needed, even before the registry has
 * an entry for it.
 */
export function StatusBadge({
  status,
  label,
  icon: Icon,
  className,
}: {
  /** Matched case-insensitively against `STATUS_REGISTRY`, e.g. "graded", "late", "active". */
  status: string;
  /** Override the registry's label without changing its color. */
  label?: string;
  /** Optional leading icon, e.g. a check on "Paid in full". */
  icon?: LucideIcon;
  className?: string;
}) {
  const resolved = resolveStatus(status);
  return (
    <Badge variant={TONE_TO_VARIANT[resolved.tone]} className={className}>
      {Icon && <Icon />}
      {label ?? resolved.label}
    </Badge>
  );
}
