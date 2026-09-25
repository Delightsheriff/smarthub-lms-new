"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Presentation } from "lucide-react";
import { Pager } from "@/components/ui/pager";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Stagger, StaggerItem } from "@/components/animation/stagger";
import { pluralize } from "@/lib/utils";
import { useWebinars, type WebinarsPage } from "../api/webinars.queries";
import { WebinarCard } from "./WebinarCard";
import type { WebinarSummary } from "../types";

type Tab = "upcoming" | "past";

const PAGE_SIZE = 12;

export function WebinarsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ?tab= / ?page= persist in the URL so a bookmarked or refreshed
  // "Past, page 3" view is restored instead of always resetting to
  // Upcoming — previously local-state-only.
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const fromUrl = searchParams.get("tab");
    return fromUrl === "past" ? "past" : "upcoming";
  });
  const [page, setPage] = useState<number>(() => {
    const fromUrl = Number(searchParams.get("page"));
    return Number.isFinite(fromUrl) && fromUrl > 0 ? fromUrl : 1;
  });

  const syncUrl = (tab: Tab, nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    if (tab === "past") params.set("page", String(nextPage));
    else params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
    syncUrl(tab, 1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    syncUrl(activeTab, nextPage);
  };

  const upcomingQuery = useWebinars("upcoming");
  const pastQuery = useWebinars("past", { page, pageSize: PAGE_SIZE });

  const upcomingList = (upcomingQuery.data as WebinarSummary[]) || [];
  const pastPage = pastQuery.data as WebinarsPage | undefined;
  const pastList = pastPage?.items || [];

  const webinars = activeTab === "upcoming" ? upcomingList : pastList;
  const isLoading = activeTab === "upcoming" ? upcomingQuery.isLoading : pastQuery.isLoading;
  const error = activeTab === "upcoming" ? upcomingQuery.error : pastQuery.error;

  const dateline = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        divider
        dateline={`${dateline} · Live Sessions & Masterclasses`}
        title="Webinars & Workshops"
        description={
          upcomingList.length > 0 ? (
            <>
              Join live industry sessions, masterclasses, and workshops.{" "}
              <strong className="text-foreground">{upcomingList.length}</strong> {pluralize(upcomingList.length, "upcoming session", undefined, false)}.
            </>
          ) : (
            "Join live industry sessions, masterclasses, and rewatch past recorded workshops."
          )
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as Tab)}>
              <TabsList className="rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="upcoming" className="rounded-lg text-xs">
                  Upcoming ({upcomingList.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="rounded-lg text-xs">
                  Past Recordings
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <RefreshButton
              loading={upcomingQuery.isFetching || pastQuery.isFetching}
              onClick={() => Promise.allSettled([upcomingQuery.refetch(), pastQuery.refetch()])}
            />
          </div>
        }
      />

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-destructive">
            Failed to load webinars. Please try again.
          </p>
        </div>
      )}

      {/* Grid Content */}
      {!isLoading && !error && (
        <>
          {webinars.length > 0 ? (
            <>
              <Stagger className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {webinars.map((webinar) => (
                  <StaggerItem key={webinar.id}>
                    <WebinarCard webinar={webinar} />
                  </StaggerItem>
                ))}
              </Stagger>

              {activeTab === "past" && pastPage && (pastPage.meta.totalPages ?? 1) > 1 && (
                <Pager
                  page={page}
                  totalPages={pastPage.meta.totalPages ?? 1}
                  onPage={handlePageChange}
                  label={pastPage.meta.totalItems ? `${pastPage.meta.totalItems} ${pluralize(pastPage.meta.totalItems, "recording", undefined, false)}` : undefined}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Presentation}
              title={`No ${activeTab} webinars available`}
              description={
                activeTab === "upcoming"
                  ? "Check back soon for newly scheduled live workshops and masterclasses."
                  : "No recorded past webinars found in the library."
              }
            />
          )}
        </>
      )}
    </div>
  );
}
