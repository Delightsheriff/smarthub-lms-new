"use client";

import React, { useState } from "react";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAssignments } from "../api/assignments.queries";
import { AssignmentListCard } from "./assignment-list-card";

export function AssignmentListPageContent() {
  const { data: assignments, isLoading, error } = useMyAssignments();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = (assignments || []).filter(({ assignment, course, module }) => {
    const searchMatch =
      !search ||
      assignment.title.toLowerCase().includes(search.toLowerCase()) ||
      course?.name.toLowerCase().includes(search.toLowerCase()) ||
      module?.title.toLowerCase().includes(search.toLowerCase());

    if (!searchMatch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "pending")
      return assignment.status === "draft" || assignment.status === "returned";
    if (statusFilter === "submitted") return assignment.status === "submitted";
    if (statusFilter === "graded") return assignment.status === "graded";
    if (statusFilter === "overdue") return assignment.status === "overdue";

    return true;
  });

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      {/* Header Banner */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          My Assignments
        </h1>
        <p className="text-sm text-muted-foreground">
          View deadlines, submit coursework, and review instructor grades across your enrolled courses.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments by title or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="all" className="rounded-lg text-xs">
              All ({assignments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-lg text-xs">
              Pending
            </TabsTrigger>
            <TabsTrigger value="submitted" className="rounded-lg text-xs">
              Submitted
            </TabsTrigger>
            <TabsTrigger value="graded" className="rounded-lg text-xs">
              Graded
            </TabsTrigger>
            <TabsTrigger value="overdue" className="rounded-lg text-xs">
              Overdue
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-destructive">
            Failed to load assignments. Please refresh or try again later.
          </p>
        </div>
      )}

      {/* Content Grid */}
      {!isLoading && !error && (
        <>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(({ assignment, course, module }) => (
                <AssignmentListCard
                  key={assignment.id}
                  assignment={assignment}
                  course={course}
                  module={module}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No assignments found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No assignments match your selected filter or search criteria.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
