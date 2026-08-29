"use client";
import { useQuery } from "@tanstack/react-query";
import { helpService } from "./help.service";
import type { ApiHelpResource } from "../types/api.types";

export const HELP_QUERY_KEYS = {
  library: ["help", "library"] as const,
};

/** Group the (already server-ordered) feed into categories. Pure so the
 *  unit tests can target it without the wire. */
export function groupByCategory(resources: ApiHelpResource[]): Array<{
  name: string;
  resources: ApiHelpResource[];
}> {
  const seen = new Map<string, ApiHelpResource[]>();
  for (const r of resources) {
    const list = seen.get(r.category) ?? [];
    list.push(r);
    seen.set(r.category, list);
  }
  return Array.from(seen.entries()).map(([name, items]) => ({
    name,
    resources: items,
  }));
}

export function useHelpLibrary(mode: "student" | "instructor") {
  return useQuery<ApiHelpResource[]>({
    queryKey: [...HELP_QUERY_KEYS.library, mode],
    queryFn: () => helpService.getLibrary(mode),
  });
}