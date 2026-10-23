import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  experimental: {
    // Sajt ima dva root layout-a ((ulaz) za "/" i [lang]), pa 404 ide kroz global-not-found.tsx.
    globalNotFound: true,
  },
};

export default nextConfig;
