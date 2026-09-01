"use client";

import React, { useState } from "react";
import { Presentation, Video } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebinars } from "../api/webinars.queries";
import { WebinarCard } from "./WebinarCard";

export function WebinarsPageContent() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const upcomingQuery = useWebinars({ sort: "upcoming" });
  const pastQuery = useWebinars({ sort: "past" });

  const activeQuery = activeTab === "upcoming" ? upcomingQuery : pastQuery;
  const webinars = activeQuery.data || [];
  const isLoading = activeQuery.isLoading;
  const error = activeQuery.error;

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Webinars & Workshops
          </h1>
          <p className="text-sm text-muted-foreground">
            Join live industry sessions, masterclasses, and rewatch past recorded workshops.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "upcoming" | "past")}
        >
          <TabsList className="rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="upcoming" className="rounded-lg text-xs">
              Upcoming ({upcomingQuery.data?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg text-xs">
              Past Recordings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {webinars.map((webinar) => (
                <WebinarCard key={webinar.id} webinar={webinar} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Presentation className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No {activeTab} webinars available
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {activeTab === "upcoming"
                  ? "Check back soon for newly scheduled live workshops and masterclasses."
                  : "No recorded past webinars found in the library."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
