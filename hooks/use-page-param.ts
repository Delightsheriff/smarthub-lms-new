"use client";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Keep a list's current page in the URL as `?page=…` so a refresh or a
 * shared link lands on the page the reader was actually on, instead of
 * snapping back to the first one.
 *
 *   const [page, setPage] = usePageParam();
 *
 * Drop-in for `useState(1)` — same tuple, and it accepts the
 * functional-updater form, so prev/next buttons written as
 * `setPage((p) => p - 1)` keep working untouched.
 *
 * Follows the URL-state idiom already used for the calendar view and
 * the profile tab: `router.replace` (not `push`) so paging doesn't
 * bury the back button, and `{ scroll: false }` so the viewport stays
 * put. The param is removed rather than written as `?page=1`, keeping
 * a first-page URL clean.
 *
 * `paramKey` matters when one route shows more than one paginated
 * list — they would otherwise fight over the same param.
 */
export function usePageParam(
  paramKey = "page"
): [number, (next: number | ((prev: number) => number)) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // A hand-edited `?page=0` / `?page=-1` / `?page=abc` should show the
  // first page rather than sending nonsense to the API.
  const raw = Number(searchParams?.get(paramKey));
  const page = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;

  const set = useCallback(
    (next: number | ((prev: number) => number)) => {
      const value = typeof next === "function" ? next(page) : next;
      const params = new URLSearchParams(searchParams?.toString() || "");

      if (!Number.isFinite(value) || value <= 1) {
        params.delete(paramKey);
      } else {
        params.set(paramKey, String(Math.floor(value)));
      }

      const qs = params.toString();
      // Nothing to do when the URL wouldn't change — stops a filter
      // reset to page 1 from firing a pointless navigation on mount.
      if (qs === (searchParams?.toString() || "")) return;

      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams, paramKey, page]
  );

  return [page, set];
}
