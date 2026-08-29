"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useBranding } from "@/modules/branding/api/branding.queries";

interface LogoProps {
  /** Visual size — `sm` for the side rail / top bar lockup. */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Brand lockup. Renders both the colour and dark-mode SVG variants in
 * the DOM and uses Tailwind's `dark:` variant to swap visibility (no
 * `useTheme` mount dance, no flash on first paint).
 *
 * Sources come from runtime branding (`GET /platform/branding`, via the
 * `useBranding` hook). The hook resolves to the bundled SVG fallbacks
 * while loading or if the endpoint is ever absent — so this stays a
 * pure swap with zero visual change under the mock.
 */
export function Logo({ size = "sm", className }: LogoProps) {
  const branding = useBranding();
  const dims = size === "sm" ? { w: 140, h: 42 } : { w: 180, h: 54 };
  const heightClass = size === "sm" ? "h-8 w-auto" : "h-10 w-auto";

  const colorSrc = branding.logos.color?.svg || branding.logos.primary?.svg;
  const darkSrc =
    branding.logos.dark?.svg || branding.logos.primary?.svg || colorSrc;

  return (
    <span
      className={cn("inline-block leading-none", className)}
      aria-label="SmartHub"
    >
      <Image
        src={colorSrc}
        alt=""
        width={dims.w}
        height={dims.h}
        className={cn(heightClass, "block dark:hidden")}
        unoptimized
      />
      <Image
        src={darkSrc}
        alt=""
        width={dims.w}
        height={dims.h}
        className={cn(heightClass, "hidden dark:block")}
        unoptimized
      />
    </span>
  );
}