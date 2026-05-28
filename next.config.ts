import type { NextConfig } from "next";

import { normalizeApiUrl, parseApiDomainMap } from "./configs/apiDomainMap";

const normalizeUrl = (value: string) =>
  value.startsWith("http") ? value : `https://${value}`;

const apiEndPoint = process.env.API_END_POINT || "http://localhost:9000";

const apiImageUrl = new URL(normalizeUrl(apiEndPoint));
const mappedApiImageUrls = Object.values(
  parseApiDomainMap(process.env.API_DOMAIN_MAP || process.env.NEXT_PUBLIC_API_DOMAIN_MAP),
).map((url) => new URL(normalizeApiUrl(url)));

const apiImageRemotePatterns = [
  apiImageUrl,
  ...mappedApiImageUrls,
].map((url) => ({
  protocol: url.protocol.replace(":", "") as "http" | "https",
  hostname: url.hostname,
  port: url.port,
  pathname: "/**",
}));

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      ...apiImageRemotePatterns,
      {
        protocol: "https",
        hostname: "api.*",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/football/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${apiEndPoint}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
