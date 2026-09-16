"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { jobsService } from "./jobs.service";
import type { JobsQuery } from "../types";

export const JOBS_QUERY_KEYS = {
  list: (q: JobsQuery) => ["jobs", "list", q] as const,
  companies: ["jobs", "companies"] as const,
};

export function useJobs(query: JobsQuery) {
  return useQuery({
    queryKey: JOBS_QUERY_KEYS.list(query),
    queryFn: () => jobsService.list(query),
    // Paging and filtering refetch from the server; without this the
    // list blanks to a spinner on every keystroke.
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useJobCompanies() {
  return useQuery({
    queryKey: JOBS_QUERY_KEYS.companies,
    queryFn: () => jobsService.companies(),
    staleTime: 30 * 60 * 1000,
  });
}
