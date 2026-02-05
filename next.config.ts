import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co", pathname: "/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/**" },
      { protocol: "https", hostname: "m.media-amazon.com", pathname: "/**" },
      { protocol: "https", hostname: "books.google.com", pathname: "/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
