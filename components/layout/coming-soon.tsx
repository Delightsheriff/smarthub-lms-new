import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder for routes that exist in the skeleton but aren't built yet
 * (Plan 002). Renders the real page heading plus a skeleton shimmer so
 * navigation has a target that clearly reads "coming soon" in the new
 * design system.
 */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">Coming soon.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Preview</CardTitle>
          <CardDescription>
            This surface will be built in a later slice.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
