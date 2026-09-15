"use client";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// next/image only has Cloudinary whitelisted (next.config.ts); any other
// host would throw at render, so those fall back to the placeholder.
const canOptimise = (url?: string) =>
  !!url && /^https:\/\/res\.cloudinary\.com\//.test(url);

export function CourseCover({
  imageUrl,
  name,
  sizes,
  className,
}: {
  imageUrl?: string;
  name: string;
  sizes: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10",
        className
      )}
    >
      {canOptimise(imageUrl) ? (
        <Image
          src={imageUrl as string}
          alt={name}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="h-7 w-7 text-primary/30" />
        </div>
      )}
    </div>
  );
}
