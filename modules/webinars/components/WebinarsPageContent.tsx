"use client";

import React, { useState } from "react";
import { Presentation } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Stagger, StaggerItem } from "@/components/animation/stagger";
import { useWebinars } from "../api/webinars.queries";
import { WebinarCard } from "./WebinarCard";
import type { WebinarSummary } from "../types";

export function WebinarsPageContent() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const upcomingQuery = useWebinars("upcoming");
  const pastQuery = useWebinars("past", { page: 1, pageSize: 12 });

  const upcomingList = (upcomingQuery.data as WebinarSummary[]) || [];
  const pastList = (pastQuery.data as { items: WebinarSummary[] } | undefined)?.items || [];

  const webinars = activeTab === "upcoming" ? upcomingList : pastList;
  const isLoading = activeTab === "upcoming" ? upcomingQuery.isLoading : pastQuery.isLoading;
  const error = activeTab === "upcoming" ? upcomingQuery.error : pastQuery.error;

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <PageHeader
        title="Webinars & Workshops"
        description="Join live industry sessions, masterclasses, and rewatch past recorded workshops."
        actions={
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "upcoming" | "past")}
          >
            <TabsList className="rounded-xl bg-muted/60 p-1">
              <TabsTrigger value="upcoming" className="rounded-lg text-xs">
                Upcoming ({upcomingList.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="rounded-lg text-xs">
                Past Recordings
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
            <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {webinars.map((webinar) => (
                <StaggerItem key={webinar.id}>
                  <WebinarCard webinar={webinar} />
                </StaggerItem>
              ))}
            </Stagger>
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
