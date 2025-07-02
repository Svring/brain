import { withPayload } from "@payloadcms/next/withPayload";

// Define regex patterns at top level to avoid performance issues
const CRITICAL_DEPENDENCY_WARNING =
  /Critical dependency: the request of a dependency is an expression/;
const MODULE_NOT_FOUND_WARNING = /Module not found: Can't resolve/;

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config: any, { isServer }: any) => {
    // Suppress webpack warnings for known issues
    config.ignoreWarnings = [
      CRITICAL_DEPENDENCY_WARNING,
      MODULE_NOT_FOUND_WARNING,
    ];

    // Handle node modules that have dynamic imports
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push("prettier");
    }

    return config;
  },
};

export default withPayload(nextConfig);
