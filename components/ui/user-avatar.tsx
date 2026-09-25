"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  /** Cloudinary (or any) URL for the user's photo. Renders initials
   *  when missing, empty, or when the image errors out. */
  imageUrl?: string | null;
  /** Full name used to derive the initials fallback. We accept the
   *  full name rather than a precomputed initial so a future change
   *  to "first + last initial" doesn't ripple to every caller. */
  name?: string;
  /** Used as the alt text on the loaded image; defaults to name. */
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  /** When true AND a real image is present, clicking the avatar opens
   *  an enlarged preview modal. Opt-in so lists and rows that don't
   *  want the interaction stay plain. No-ops on the initials fallback
   *  — there's nothing to enlarge. */
  zoomable?: boolean;
}

const SIZE_MAP: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-2xl",
};

const initialsOf = (name: string | undefined): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
  }
  return name.charAt(0).toUpperCase() || "?";
};

/**
 * Canonical user avatar for the LMS — rosters, attendance sheets,
 * cohort cards, the top-bar menu, anywhere a person needs to be
 * visually identified. Falls back to initials in a primary-tinted
 * bubble when there's no photo.
 *
 * Pass `zoomable` to make it click-to-enlarge (photo only).
 */
export function UserAvatar({
  imageUrl,
  name,
  alt,
  size = "sm",
  className,
  zoomable,
}: UserAvatarProps) {
  const [open, setOpen] = useState(false);

  const avatar = (
    <Avatar className={cn(SIZE_MAP[size], className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt={alt || name || ""} />}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {initialsOf(name)}
      </AvatarFallback>
    </Avatar>
  );

  // Nothing to enlarge without a real image
  if (!zoomable || !imageUrl) return avatar;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={name ? `View ${name}'s photo` : "View photo"}
        className="rounded-full outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-zoom-in"
      >
        {avatar}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-4 sm:p-6 rounded-2xl border-border bg-card">
          <DialogTitle className="sr-only">
            {name ? `${name}'s photo` : "Photo"}
          </DialogTitle>
          <div className="flex flex-col items-center gap-3">
            <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl border border-border bg-muted">
              {/* External Cloudinary or remote image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={alt || name || "User photo"}
                className="h-full w-full object-cover"
              />
            </div>
            {name && (
              <p className="font-display text-sm font-semibold text-foreground">
                {name}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
