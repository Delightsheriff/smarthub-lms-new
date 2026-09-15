import { cn } from "@/lib/utils";

/**
 * A ring, not a bar — for the one or two numbers per page that deserve
 * more visual weight than the linear `Progress` gives them (a course's
 * overall completion at the top of its outline rail, a catalog card's
 * "how far in" badge). Pure SVG so it themes through `currentColor`
 * like every other icon in the app, no extra dependency.
 */
export function CircularProgress({
  value,
  size = 40,
  strokeWidth = 4,
  className,
  trackClassName,
  indicatorClassName,
  children,
}: {
  /** 0–100. */
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  children?: React.ReactNode;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={cn("stroke-muted", trackClassName)}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("stroke-primary transition-[stroke-dashoffset] duration-500 ease-out", indicatorClassName)}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
