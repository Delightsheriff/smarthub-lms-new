/**
 * Standard staleTime tiers for TanStack Query across SmartHub LMS.
 * Replaces ad hoc magic numbers with documented, named durations.
 */
export const STALE_TIME = {
  /** Search, typeahead, or frequently shifting real-time feeds (30s). */
  REALTIME: 30 * 1000,
  /** Baseline stale time matching QueryClient's global default (60s). */
  DEFAULT: 60 * 1000,
  /** Infrequently changing data within a session: catalog, entitlements, achievements (5m). */
  SLOW: 5 * 60 * 1000,
  /** Slowly moving aggregations and pulse summaries (10m). */
  EXTENDED: 10 * 60 * 1000,
  /** Effectively static lookups throughout a user session (e.g. company names list) (30m). */
  VERY_SLOW: 30 * 60 * 1000,
} as const;
