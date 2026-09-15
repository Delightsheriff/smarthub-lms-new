import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";

/**
 * The logo + centered column every auth screen sits in. Extracted so
 * the page background lives in exactly one place — `(auth)/layout.tsx`
 * — instead of every page re-declaring its own `min-h-screen` wrapper
 * with its own `bg-background`. That duplication was the actual bug:
 * the layout already centers `{children}` full-page with its own
 * background, so a second nested full-height box (confined to the
 * layout's max-width column) painted a visibly different background
 * only under the card, not across the page.
 *
 * Use `AuthColumn` directly for a state that isn't the standard
 * card+header shape (a loading skeleton, an error panel, a success
 * confirmation); use `AuthCard` for the common "title, description,
 * form" shape most auth screens actually have.
 */
export function AuthColumn({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex justify-center">
        <Logo />
      </div>
      {children}
    </div>
  );
}

/** The card shell alone (title/description/content, no outer column or
 *  logo) — for a screen that renders more than one possible body
 *  (loading, error, success) under a single shared `AuthColumn`, where
 *  wrapping each body in its own `AuthCard` would duplicate the logo. */
export function AuthCardBody({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="space-y-4 rounded-2xl border bg-card p-6 shadow-md">
      <CardHeader className="space-y-1 p-0 text-center">
        <CardTitle className="text-xl font-bold text-foreground">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0 pt-2">{children}</CardContent>
    </Card>
  );
}

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AuthColumn>
      <AuthCardBody title={title} description={description}>
        {children}
      </AuthCardBody>
    </AuthColumn>
  );
}
