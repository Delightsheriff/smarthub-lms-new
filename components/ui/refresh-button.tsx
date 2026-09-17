"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RefreshButton({
  loading = false,
  onClick,
}: {
  loading?: boolean;
  onClick: () => unknown;
}) {
  return (
    <Button type="button" variant="outline" size="icon-sm" aria-label="Refresh" onClick={() => void onClick()} disabled={loading}>
      <RefreshCw className={loading ? "animate-spin" : ""} />
    </Button>
  );
}
