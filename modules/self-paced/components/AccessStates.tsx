"use client";
import Link from "next/link";
import { AlertTriangle, Lock, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { publicSiteOrigin } from "@/lib/public-origin";
import { SELF_PACED_ROUTES } from "../config/endpoints";
import { entitlementDenial, isNotFound } from "../lib/access-denial";
import type { EntitlementDenial } from "../types";

const COPY: Record<EntitlementDenial, { title: string; body: string }> = {
  none: {
    title: "You don't have access to this course",
    body: "This course isn't on your account. If you've just paid, it can take a minute to appear — otherwise message us and we'll look into it.",
  },
  revoked: {
    title: "Your access to this course was withdrawn",
    body: "The lessons are no longer available on your account. Your other courses are unaffected. Message us if you think this is a mistake.",
  },
  expired: {
    title: "Your access to this course has expired",
    body: "Your access period has ended, so the lessons are locked. Your progress is kept if you regain access.",
  },
};

function StateCard({
  icon,
  title,
  body,
  actions,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  actions: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl py-10">
      <Card className="p-6 sm:p-8 rounded-2xl border-border bg-card shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        <div className="mt-6 flex flex-wrap gap-2">{actions}</div>
      </Card>
    </div>
  );
}

/**
 * One place that turns a failed self-paced request into a screen: an
 * entitlement refusal, a missing course/lesson, or a plain failure with
 * a retry.
 */
export function SelfPacedErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const denial = entitlementDenial(error);
  if (denial) {
    const copy = COPY[denial];
    return (
      <StateCard
        icon={<Lock className="h-5 w-5 text-muted-foreground" />}
        title={copy.title}
        body={copy.body}
        actions={
          <>
            <Button
              size="sm"
              nativeButton={false} render={<Link href={SELF_PACED_ROUTES.LIST}>My self-paced courses</Link>}
            />
            {denial === "none" ? (
              <Button
                size="sm"
                variant="outline"
                render={
                  <a href={publicSiteOrigin()} target="_blank" rel="noopener noreferrer">
                    Browse courses
                  </a>
                }
              />
            ) : null}
            <Button
              size="sm"
              variant="outline"
              nativeButton={false} render={<Link href="/inbox">Message us</Link>}
            />
          </>
        }
      />
    );
  }

  if (isNotFound(error)) {
    return (
      <StateCard
        icon={<SearchX className="h-5 w-5 text-muted-foreground" />}
        title="We couldn't find that"
        body="The course or lesson may have been moved or removed."
        actions={
          <Button
            size="sm"
            nativeButton={false} render={<Link href={SELF_PACED_ROUTES.LIST}>My self-paced courses</Link>}
          />
        }
      />
    );
  }

  return (
    <StateCard
      icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
      title="Something went wrong"
      body="We couldn't load this right now. Check your connection and try again."
      actions={
        onRetry ? (
          <Button size="sm" onClick={onRetry}>
            Try again
          </Button>
        ) : (
          <Button
            size="sm"
            nativeButton={false} render={<Link href={SELF_PACED_ROUTES.LIST}>My self-paced courses</Link>}
          />
        )
      }
    />
  );
}
