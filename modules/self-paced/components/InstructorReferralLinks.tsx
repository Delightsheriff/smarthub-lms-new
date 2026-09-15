"use client";
import { useSyncExternalStore, useState } from "react";
import {
  Copy,
  Link2,
  MessageCircle,
  RotateCcw,
  Share2,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  useIssueInstructorLink,
  useMyInstructorLinks,
  useRevokeInstructorLink,
} from "../api/instructor.queries";
import { apiErrorCode } from "../lib/access-denial";
import { formatMinor } from "../lib/format";
import { referralShareUrl } from "../lib/share-link";
import type {
  CourseWithoutLink,
  InstructorLink,
} from "../types/instructor.types";

/** Issue refusals the API names with an `errorCode`; message text is
 *  the fallback for anything unnamed. */
const ISSUE_ERROR_COPY: Record<string, string> = {
  INSTRUCTOR_NOT_ON_COURSE:
    "You're no longer named as an instructor on this course, so it can't carry your link. Ask an admin if that's wrong.",
  COURSE_NOT_SELF_PACED:
    "This course isn't self-paced any more, so it doesn't take referral links.",
  INSTRUCTOR_NOT_FOUND:
    "Your account has no instructor profile yet. Ask an admin to set one up.",
};

const issueErrorMessage = (error: unknown): string => {
  const code = apiErrorCode(error);
  if (code && ISSUE_ERROR_COPY[code]) return ISSUE_ERROR_COPY[code];
  return error instanceof ApiError && error.message
    ? error.message
    : "Couldn't get your link. Please try again.";
};

const emptySubscribe = () => () => {};

/**
 * "My referral links": one row per self-paced course the instructor is
 * named on — the shareable public-site link and code with copy / share,
 * whether it's active, and what it has sold. Courses without a link yet
 * offer "Get my link".
 *
 * Revoking is destructive for anyone holding the posted link (it stops
 * attributing sales), so it goes through a confirm. Reactivating brings
 * the same code back — the API keeps it stable per course.
 */
export function InstructorReferralLinks() {
  const { data, isLoading, error, refetch } = useMyInstructorLinks();
  const issue = useIssueInstructorLink();
  const revoke = useRevokeInstructorLink();
  const [revoking, setRevoking] = useState<InstructorLink | null>(null);
  const [issuingFor, setIssuingFor] = useState<string | null>(null);

  const issueFor = async (courseId: string, reactivating: boolean) => {
    if (issue.isPending) return;
    setIssuingFor(courseId);
    try {
      await issue.mutateAsync(courseId);
      toast.success(
        reactivating ? "Referral link reactivated" : "Referral link ready"
      );
    } catch (e) {
      toast.error(issueErrorMessage(e));
    } finally {
      setIssuingFor(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center space-y-3 border-destructive/20 bg-destructive/5">
        <p className="font-semibold">We couldn&apos;t load your referral links</p>
        <Button size="sm" onClick={() => void refetch()}>
          Try again
        </Button>
      </Card>
    );
  }

  const links = data?.links ?? [];
  const without = data?.coursesWithoutLink ?? [];

  if (links.length === 0 && without.length === 0) {
    return (
      <Card className="p-10 text-center">
        <Link2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="font-semibold">No self-paced courses yet</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          When you&apos;re named as an instructor on a self-paced course,
          your referral link for it appears here.
        </p>
      </Card>
    );
  }

  // Active first, then revoked; the API already orders newest first.
  const ordered = [...links].sort(
    (a, b) => Number(b.isActive) - Number(a.isActive)
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Share a course&apos;s link anywhere. Anyone who buys through it is
        attributed to you, and your revenue share on that sale is paid at
        the referral rate.
      </p>

      {ordered.map((link) => (
        <LinkCard
          key={link._id}
          link={link}
          onRevoke={() => setRevoking(link)}
          onReactivate={() =>
            link.course?._id && void issueFor(link.course._id, true)
          }
          reactivating={issuingFor === link.course?._id}
          busy={issue.isPending}
        />
      ))}

      {without.map((course) => (
        <CourseWithoutLinkCard
          key={course._id}
          course={course}
          onIssue={() => void issueFor(course._id, false)}
          issuing={issuingFor === course._id}
          busy={issue.isPending}
        />
      ))}

      <AlertDialog
        open={!!revoking}
        onOpenChange={(open) => !open && setRevoking(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this referral link?</AlertDialogTitle>
            <AlertDialogDescription>
              Your link for <strong>{revoking?.course?.name ?? "this course"}</strong>{" "}
              (<span className="font-mono">{revoking?.code}</span>) will stop
              attributing new sales to you, wherever it&apos;s been posted.
              Sales it already made keep their attribution, and you can
              reactivate the same link later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoke.isPending}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={revoke.isPending}
              onClick={async () => {
                if (!revoking) return;
                try {
                  await revoke.mutateAsync(revoking._id);
                  toast.success(
                    `Referral link for ${revoking.course?.name ?? "the course"} revoked`
                  );
                  setRevoking(null);
                } catch (e) {
                  // Leave the dialog open so the instructor can retry.
                  toast.error(
                    e instanceof ApiError && e.message
                      ? e.message
                      : "Couldn't revoke the link. Please try again."
                  );
                }
              }}
            >
              {revoke.isPending ? "Revoking…" : "Revoke link"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LinkCard({
  link,
  onRevoke,
  onReactivate,
  reactivating,
  busy,
}: {
  link: InstructorLink;
  onRevoke: () => void;
  onReactivate: () => void;
  reactivating: boolean;
  busy: boolean;
}) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const shareUrl = isClient ? referralShareUrl(link) : "";
  const canNativeShare = isClient && typeof navigator !== "undefined" && !!navigator.share;

  const courseName = link.course?.name ?? "Self-paced course";
  const shareText = `Learn ${courseName} at your own pace on SmartHub: ${shareUrl}`;
  const gross = Object.entries(link.stats?.grossMinorByCurrency ?? {});

  const copy = async (value: string, what: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${what} copied`);
    } catch {
      toast.error("Could not copy. Please copy manually.");
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: courseName, text: shareText, url: shareUrl });
    } catch {
      // Dismissed share sheet — nothing to report.
    }
  };

  return (
    <Card
      className={
        "p-4 sm:p-5 space-y-3 " + (link.isActive ? "" : "bg-muted/30")
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold leading-tight">{courseName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Code{" "}
            <button
              type="button"
              onClick={() => void copy(link.code, "Code")}
              className="font-mono font-medium text-foreground hover:underline"
              title="Copy code"
            >
              {link.code}
            </button>
            {link.createdAt ? ` · issued ${formatDate(link.createdAt)}` : ""}
          </p>
        </div>
        {link.isActive ? (
          <Badge
            variant="outline"
            className="border-emerald-500/30 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">
            Revoked{link.revokedAt ? ` ${formatDate(link.revokedAt)}` : ""}
          </Badge>
        )}
      </div>

      {link.isActive ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <Input
            readOnly
            value={shareUrl}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="flex-1"
            aria-label={`Referral link for ${courseName}`}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="h-11 px-3"
              onClick={() => void copy(shareUrl, "Link")}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
            {canNativeShare ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-11 px-3"
                onClick={() => void nativeShare()}
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-11 px-3"
              render={
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              }
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          This link no longer attributes sales. Reactivate it to bring the
          same link and code back.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground tabular-nums">
            {link.stats?.paidOrders ?? 0}
          </strong>{" "}
          paid {link.stats?.paidOrders === 1 ? "sale" : "sales"}
          {gross.length > 0 && (
            <>
              {" · "}
              {gross
                .map(([currency, minor]) => formatMinor(minor, currency))
                .join(" + ")}{" "}
              gross
            </>
          )}
          {(link.stats?.refundedOrders ?? 0) > 0 &&
            ` · ${link.stats.refundedOrders} refunded`}
        </p>
        {link.isActive ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onRevoke}
          >
            <ShieldOff className="h-3.5 w-3.5" />
            Revoke
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy || !link.course?._id}
            onClick={onReactivate}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {reactivating ? "Reactivating…" : "Reactivate"}
          </Button>
        )}
      </div>
    </Card>
  );
}

function CourseWithoutLinkCard({
  course,
  onIssue,
  issuing,
  busy,
}: {
  course: CourseWithoutLink;
  onIssue: () => void;
  issuing: boolean;
  busy: boolean;
}) {
  return (
    <Card className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-dashed">
      <div className="min-w-0">
        <p className="font-semibold leading-tight">{course.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {course.isPublished
            ? "No referral link yet."
            : "Not published yet — you can get the link now; it works once the course is live."}
        </p>
      </div>
      <Button type="button" size="sm" disabled={busy} onClick={onIssue}>
        <Link2 className="h-3.5 w-3.5" />
        {issuing ? "Getting link…" : "Get my link"}
      </Button>
    </Card>
  );
}
