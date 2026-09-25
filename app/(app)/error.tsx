"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Segment error boundary for `(app)` routes. Renders inside `AppShell`
 * keeping the topbar, sidebar, and layout chrome intact while presenting
 * an actionable retry button.
 */
export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Segment error caught in AppShell:", error);
  }, [error]);

  return (
    <div className="py-12">
      <EmptyState
        icon={AlertCircle}
        title="Something went wrong"
        description={
          error.message ||
          "An unexpected error occurred while loading this page. Try again to reload the content."
        }
        action={
          <Button onClick={reset} className="rounded-xl mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        }
      />
    </div>
  );
}
