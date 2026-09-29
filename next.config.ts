import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local-dev database only; kept out of the server bundle.
  serverExternalPackages: ["@electric-sql/pglite"],
  async headers() {
    return [
      {
        // Belt and braces alongside the page-level robots meta: demos must never be indexed.
        source: "/demo/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/me/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
