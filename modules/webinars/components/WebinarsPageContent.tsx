"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Stagger, StaggerItem } from "@/components/animation/stagger";
import { useWebinars } from "../api/webinars.queries";
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
  const pastPage = pastQuery.data as
    | { items: WebinarSummary[]; meta: { totalPages: number; currentPage: number } }
    | undefined;
  const pastList = pastPage?.items || [];

  const webinars = activeTab === "upcoming" ? upcomingList : pastList;
  const isLoading = activeTab === "upcoming" ? upcomingQuery.isLoading : pastQuery.isLoading;
  const error = activeTab === "upcoming" ? upcomingQuery.error : pastQuery.error;

  return (
    <div className="space-y-6">
      <PageHeader
        variant="editorial"
        eyebrow="Webinars"
        title="Webinars & Workshops"
        description="Join live industry sessions, masterclasses, and rewatch past recorded workshops."
        actions={
          <div className="flex items-center gap-2">
            <RefreshButton
              loading={upcomingQuery.isFetching || pastQuery.isFetching}
              onClick={() => Promise.allSettled([upcomingQuery.refetch(), pastQuery.refetch()])}
            />
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
          </div>
        }
      />

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {webinars.map((webinar) => (
                  <StaggerItem key={webinar.id}>
                    <WebinarCard webinar={webinar} />
                  </StaggerItem>
                ))}
              </Stagger>

              {activeTab === "past" && pastPage && pastPage.meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    Page {pastPage.meta.currentPage} of {pastPage.meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pastPage.meta.totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
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
