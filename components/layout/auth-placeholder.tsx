import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder for an `(auth)` route that isn't built yet (real auth lands
 * in Plan 012). Renders a centered card in the auth panel layout with a
 * skeleton field preview so the route has a target that reads clearly as
 * "coming soon".
 */
export function AuthPlaceholder({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Coming soon.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}
