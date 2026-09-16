/**
 * UI shapes for the global command-palette search. The API returns
 * enrolment-scoped, mode-aware, pre-grouped results with server-built
 * deep-link hrefs; the client renders them verbatim. `iconHint` is a
 * stable string mapped to a lucide icon in `api/normalise.ts`.
 */

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  iconHint?: string;
}

export interface SearchGroup {
  type: string;
  label: string;
  results: SearchResult[];
}
