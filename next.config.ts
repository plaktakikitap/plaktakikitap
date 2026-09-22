import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/planner", destination: "/home#ajanda", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co", pathname: "/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/**" },
      { protocol: "https", hostname: "m.media-amazon.com", pathname: "/**" },
      { protocol: "https", hostname: "covers.openlibrary.org", pathname: "/**" },
      { protocol: "https", hostname: "books.google.com", pathname: "/**" },
      { protocol: "https", hostname: "*.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
      { protocol: "https", hostname: "lastfm.freetls.fastly.net", pathname: "/**" },
      { protocol: "https", hostname: "lastfm-img.freetls.fastly.net", pathname: "/**" },
      { protocol: "https", hostname: "*.freetls.fastly.net", pathname: "/**" },
      { protocol: "https", hostname: "1000kitap.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.1000kitap.com", pathname: "/**" },
      { protocol: "https", hostname: "*.1000kitap.com", pathname: "/**" },
      { protocol: "https", hostname: "1k-cdn.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
