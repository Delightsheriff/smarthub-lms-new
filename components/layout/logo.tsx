"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";

const COLOR_SRC = "/images/smarthub-logo-color.svg";
const DARK_SRC = "/images/smarthub-logo-dark.svg";

interface LogoProps {
  /** Visual size — `sm` for the side rail / top bar lockup. */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Brand lockup. Renders both the colour and dark-mode SVG variants in
 * the DOM and uses Tailwind's `dark:` variant to swap visibility (no
 * `useTheme` mount dance, no flash on first paint). Assets are the
 * bundled SmartHub SVGs reused from the legacy codebase — there is no
 * runtime `/platform/branding` endpoint in this phase, so we render the
 * bundled fallbacks directly.
 */
export function Logo({ size = "sm", className }: LogoProps) {
  const dims = size === "sm" ? { w: 140, h: 42 } : { w: 180, h: 54 };
  const heightClass = size === "sm" ? "h-8 w-auto" : "h-10 w-auto";

  return (
    <span
      className={cn("inline-block leading-none", className)}
      aria-label="SmartHub"
    >
      <Image
        src={COLOR_SRC}
        alt=""
        width={dims.w}
        height={dims.h}
        className={cn(heightClass, "block dark:hidden")}
        unoptimized
      />
      <Image
        src={DARK_SRC}
        alt=""
        width={dims.w}
        height={dims.h}
        className={cn(heightClass, "hidden dark:block")}
        unoptimized
      />
    </span>
  );
}
