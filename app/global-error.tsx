"use client";

import { Button } from "@/components/ui/button";

// Global error boundary for the ROOT layout. Must render its own
// `<html>` and `<body>` (the root layout is replaced while this is
// shown). Client Component — no metadata/fonts from next/font here.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <p className="text-sm font-medium tracking-widest text-foreground/50">
          Error · {error.digest ?? "Unexpected"}
        </p>
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          An unexpected error occurred. You can try again, or head back to the
          dashboard.
        </p>
        <Button onClick={reset}>Try again</Button>
      </body>
    </html>
  );
}
