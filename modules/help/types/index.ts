import type { ApiHelpResource } from "./api.types";

/** The library grouped by category, preserving server order. */
export interface HelpLibraryUi {
  categories: Array<{
    name: string;
    resources: ApiHelpResource[];
  }>;
  total: number;
}

export type HelpResourceUi = ApiHelpResource;