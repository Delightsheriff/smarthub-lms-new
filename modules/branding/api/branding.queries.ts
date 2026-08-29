"use client";
import { useQuery } from "@tanstack/react-query";
import { brandingService } from "./branding.service";
import type { Branding } from "../types";

/** Bundled fallback — what the shell renders before branding arrives
 *  (and if the endpoint ever fails). Kept in-sync with the mock payload
 *  so the swap is invisible in either regime. */
export const FALLBACK_BRANDING: Branding = {
  logos: {
    primary: {
      svg: "/images/smarthub-logo-color.svg",
      png: "/images/smarthub-logo-color.png",
      png2x: "/images/smarthub-logo-color@2x.png",
    },
    color: {
      svg: "/images/smarthub-logo-color.svg",
      png: "/images/smarthub-logo-color.png",
      png2x: "/images/smarthub-logo-color@2x.png",
    },
    dark: {
      svg: "/images/smarthub-logo-dark.svg",
      png: "/images/smarthub-logo-dark.png",
      png2x: "/images/smarthub-logo-dark@2x.png",
    },
  },
  socials: [],
};

export const BRANDING_QUERY_KEYS = {
  base: ["branding"] as const,
};

/** Runtime-branding source. Resolves to bundled fallbacks while loading
 *  or on error, so the shell always has a lockup to paint. */
export function useBranding(): Branding {
  const { data } = useQuery<Branding>({
    queryKey: BRANDING_QUERY_KEYS.base,
    queryFn: () => brandingService.getBranding(),
  });
  return data ?? FALLBACK_BRANDING;
}