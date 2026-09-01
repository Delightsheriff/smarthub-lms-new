"use client";

import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function getDeadlineStatus(dueAt: string, now: Date = new Date()) {
  const due = new Date(dueAt).getTime();
  if (isNaN(due)) {
    return { isOverdue: false, isUrgent: false, label: "No due date" };
  }

  const diff = due - now.getTime();

  if (diff <= 0) {
    const agoDays = Math.floor(Math.abs(diff) / 86_400_000);
    const agoHours = Math.floor((Math.abs(diff) % 86_400_000) / 3_600_000);
    const label =
      agoDays > 0
        ? `Past due by ${agoDays}d ${agoHours}h`
        : `Past due by ${agoHours}h`;
    return { isOverdue: true, isUrgent: true, label };
  }

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);

  if (days > 0) {
    return {
      isOverdue: false,
      isUrgent: days <= 1,
      label: `Due in ${days}d ${hours}h`,
    };
  }

  if (hours > 0) {
    return {
      isOverdue: false,
      isUrgent: true,
      label: `Due in ${hours}h ${mins}m`,
    };
  }

  return {
    isOverdue: false,
    isUrgent: true,
    label: `Due in ${mins}m`,
  };
}

interface CountdownToDeadlineProps {
  dueAt: string;
  className?: string;
  showIcon?: boolean;
}

export function CountdownToDeadline({
  dueAt,
  className,
  showIcon = true,
}: CountdownToDeadlineProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const status = getDeadlineStatus(dueAt, now);

  const Icon = status.isOverdue || status.isUrgent ? AlertTriangle : Clock;

  return (
    <Badge
      variant={
        status.isOverdue
          ? "destructive"
          : status.isUrgent
            ? "secondary"
            : "outline"
      }
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors",
        status.isUrgent &&
          !status.isOverdue &&
          "border-amber-500/50 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
        className,
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      <span>{status.label}</span>
    </Badge>
  );
}
