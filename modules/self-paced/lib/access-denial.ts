import { ApiError } from "@/lib/api";
import type { EntitlementDenial } from "../types";

const CODE_RE = /^ENTITLEMENT_(NONE|REVOKED|EXPIRED)$/;

/**
 * The machine-readable `errorCode` smarthub-api puts on a non-500 error
 * body when the thrower set one. Undefined for bodies without it (older
 * deployments, or errors thrown without a code).
 */
export function apiErrorCode(error: unknown): string | undefined {
  if (!(error instanceof ApiError)) return undefined;
  const code = (error.data as { errorCode?: unknown } | undefined)?.errorCode;
  return typeof code === "string" ? code : undefined;
}

/**
 * Read an entitlement refusal off a failed request.
 *
 * The API forwards the service's `errorCode` (ENTITLEMENT_NONE |
 * _REVOKED | _EXPIRED) on the 403, and that is what decides. The
 * message-text match stays as a fallback for an API still running
 * without the forwarded code — the denial sentence was the only signal
 * before it.
 */
export function entitlementDenial(error: unknown): EntitlementDenial | null {
  if (!(error instanceof ApiError) || error.status !== 403) return null;
  const errorCode = apiErrorCode(error);
  const code = errorCode ? CODE_RE.exec(errorCode)?.[1] : undefined;
  if (code) return code.toLowerCase() as EntitlementDenial;

  const data = (error.data ?? {}) as { message?: string };
  const message = (data.message ?? error.message ?? "").toLowerCase();
  if (message.includes("revoked")) return "revoked";
  if (message.includes("expired")) return "expired";
  return "none";
}

export const isNotFound = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 404;

/** Refusals and missing records won't change on a retry. */
export const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
    return false;
  }
  return failureCount < 2;
};
