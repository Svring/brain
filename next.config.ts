import MillionLint from "@million/lint";
import { withPayload } from "@payloadcms/next/withPayload";

// Define regex patterns at top level to avoid performance issues
const CRITICAL_DEPENDENCY_WARNING =
  /Critical dependency: the request of a dependency is an expression/;
const MODULE_NOT_FOUND_WARNING = /Module not found: Can't resolve/;

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Dangerously allow production builds to complete even if type errors exist.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to complete even if ESLint errors exist.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "**", // Wildcard to allow all domains
        pathname: "/**",
      },
    ],
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
      // Avoid bundling heavy native/gRPC libs into server build; resolve at runtime instead
      config.externals.push("prettier");
      config.externals.push("@grpc/grpc-js");
      config.externals.push("@grpc/proto-loader");
    }
    return config;
  },
  experimental: {
    // Forward browser logs to the terminal for easier debugging
    // browserDebugInfoInTerminal: true,
    // // Activate new client-side router improvements
    // clientSegmentCache: true,
    // // Explore route composition and segment overrides via DevTools
    // devtoolSegmentExplorer: true,
  },
};

// export default MillionLint.next({
//   enabled: true,
//   rsc: true,
// })(withPayload(nextConfig));

export default withPayload(nextConfig);
