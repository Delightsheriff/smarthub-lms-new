import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ProfilePageContent from "./page-content";

/**
 * Profile route. Server half — `ProfilePageContent` reads `?tab=` via
 * `useSearchParams`, so it must sit under a `<Suspense>` boundary for
 * the static build (see Next's `useSearchParams` docs).
 */
export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-px w-full" />
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}