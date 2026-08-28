import type { MetadataRoute } from "next";
import { BRAND } from "@/configs/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.name,
    description: "Modern learning, made simple.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: BRAND.primary,
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
