import type { NextConfig } from "next"

const nextConfig: NextConfig = {
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
