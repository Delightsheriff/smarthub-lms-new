"use client";

import React from "react";
import Image from "next/image";
import { Calendar, Users, ExternalLink, PlayCircle, Video } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { webinarStatus, webinarStatusLabel, isJoinWindowOpen } from "../lib/webinar-status";
import type { WebinarSummary } from "../types";

interface WebinarCardProps {
  webinar: WebinarSummary;
}

export function WebinarCard({ webinar }: WebinarCardProps) {
  const status = webinarStatus(webinar.date);
  const isJoinOpen = isJoinWindowOpen(webinar.date);

  const getStatusBadge = () => {
    switch (status) {
      case "ongoing":
        return (
          <Badge className="bg-red-600 hover:bg-red-700 text-white animate-pulse">
            <Video className="mr-1 h-3 w-3" /> Live Now
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Calendar className="mr-1 h-3 w-3" /> Upcoming
          </Badge>
        );
      case "passed":
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Passed
          </Badge>
        );
    }
  };

  return (
    <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-colors">
      <div className="relative w-full h-44 bg-muted overflow-hidden">
        {webinar.posterUrl ? (
          <Image
            src={webinar.posterUrl}
            alt={webinar.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
            Webinar Event
          </div>
        )}
        <div className="absolute top-3 right-3">{getStatusBadge()}</div>
      </div>

      <CardContent className="p-5 space-y-3 flex-1">
        <h3 className="text-base font-bold text-foreground line-clamp-2">
          {webinar.title}
        </h3>

        {webinar.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {webinar.description}
          </p>
        )}

        {webinar.date && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{formatDateTime(webinar.date)}</span>
          </div>
        )}

        {webinar.speakers && webinar.speakers.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
            <Users className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">Speakers: {webinar.speakers.join(", ")}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-5 pb-5 pt-0 border-t mt-auto">
        {status === "passed" && webinar.watchLink ? (
          <Button
            render={
              <a
                href={webinar.watchLink}
                target="_blank"
                rel="noreferrer"
              />
            }
            variant="outline"
            className="w-full rounded-xl mt-3"
          >
            <PlayCircle className="mr-2 h-4 w-4 text-primary" /> Watch Recording
          </Button>
        ) : webinar.joinLink ? (
          <Button
            render={
              <a
                href={webinar.joinLink}
                target="_blank"
                rel="noreferrer"
              />
            }
            disabled={!isJoinOpen && status !== "ongoing"}
            className="w-full rounded-xl mt-3"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {status === "ongoing"
              ? "Join Live Now"
              : isJoinOpen
                ? "Join Session"
                : "Join Link Opens 10m Before"}
          </Button>
        ) : (
          <Button disabled variant="outline" className="w-full rounded-xl mt-3">
            Registration Closed
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
