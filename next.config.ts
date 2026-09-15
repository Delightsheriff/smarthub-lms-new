import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Every uploaded image (course thumbnails, avatars, instructor
  // photos, help-resource thumbnails) is served from Cloudinary.
  // Without this, `next/image` rejects the remote host entirely —
  // present in legacy's next.config but dropped in this port.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // Dev-only proxy so the browser talks to the same origin (3000) that
  // fronts the app; the Next server (not the browser) reaches the API
  // on 6001 server-side. Local dev convenience only — production points
  // NEXT_PUBLIC_API_URL straight at the real API host.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return []
    return [
      {
        source: "/api-proxy/:path*",
        destination: "http://localhost:6001/api/v1/:path*",
      },
    ]
  },
  async headers() {
    return [
      {
        // Apply the noindex marker to every response during the staged
        // port. Next 16: this config-driven header is the idiomatic
        // replacement for the old middleware `X-Robots-Tag` approach —
        // no proxy file needed. (Lift once ready for public indexing.)
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ]
  },
}

export default nextConfig
