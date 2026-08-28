import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium tracking-widest text-foreground/50">
          404
        </p>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
      </div>
      <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>
        Back to dashboard
      </Link>
    </main>
  );
}
