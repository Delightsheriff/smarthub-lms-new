/**
 * The shape the API returns, used directly as the view model.
 *
 * Deliberately NOT run through a whitelist mapper. A mapper that copies
 * named fields silently drops anything added later — that is exactly how
 * `birthDay`/`birthMonth` vanished from the student profile while the
 * type still declared them, and TypeScript cannot catch it because the
 * mapper's return type is inferred as complete.
 */
export interface Job {
  _id: string;
  title: string;
  company: string;
  location?: string;
  isRemote: boolean;
  url: string;
  description?: string;
  salary?: string;
  postedAt: string;
  source: string;
  sourceBoard?: string;
}

export interface JobsPage {
  jobs: Job[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface JobsQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  company?: string;
  remote?: boolean;
  /** `mine` (default) narrows to roles matched to the student's own
   *  courses; `all` shows every published opening. */
  scope?: "mine" | "all";
}
