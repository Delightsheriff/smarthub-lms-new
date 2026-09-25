"use client";
import { useQuery } from "@tanstack/react-query";
import type { PaginationMeta } from "@/lib/api/types";
import { webinarsService } from "./webinars.service";
import { normaliseWebinar } from "./normalise";
import type { WebinarSummary } from "../types";

export interface WebinarsPage {
  items: WebinarSummary[];
  meta: PaginationMeta;
}

export function useWebinars(
  sort: "upcoming",
): ReturnType<typeof useQuery<WebinarSummary[]>>;
export function useWebinars(
  sort: "past",
  params: { page: number; pageSize: number },
): ReturnType<typeof useQuery<WebinarsPage>>;
export function useWebinars(
  sort: "upcoming" | "past",
  params?: { page: number; pageSize: number },
) {
  return useQuery<WebinarsPage | WebinarSummary[]>({
    queryKey:
      sort === "past"
        ? ["webinars", "list", "past", params?.page, params?.pageSize]
        : ["webinars", "list", "upcoming"],
    queryFn: async () => {
      if (sort === "past") {
        const res = await webinarsService.listPaginated("past", {
          page: params!.page,
          pageSize: params!.pageSize,
        });
        return { items: (res.data || []).map(normaliseWebinar), meta: res.meta };
      }
      const data = await webinarsService.list("upcoming");
      return (data || []).map(normaliseWebinar);
    },
  });
}
