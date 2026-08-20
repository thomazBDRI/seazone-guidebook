import type { NextConfig } from "next";

/**
 * cacheComponents (starter default) is intentionally off: every route renders
 * from per-property data with nothing cacheable, and its prerendered shell
 * flushes a 200 before notFound() can answer unknown codes with a real 404.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
