import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CheckInPageContent from "./page-content";

/**
 * Check-in route. Server half — `CheckInPageContent` reads
 * `?token`/`?session` via `useSearchParams`, so it must sit under a
 * `<Suspense>` boundary for the static build (see Next's
 * `useSearchParams` docs).
 */
export default function CheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <Skeleton className="h-72 w-full max-w-md rounded-2xl" />
        </div>
      }
    >
      <CheckInPageContent />
    </Suspense>
  );
}