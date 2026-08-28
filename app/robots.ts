import type { MetadataRoute } from "next";

// Staged port — not open to crawlers yet. Aligns with the global
// `X-Robots-Tag: noindex` header set in `next.config.ts` and the
// metadata `robots` posture. Revisit before public launch.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
