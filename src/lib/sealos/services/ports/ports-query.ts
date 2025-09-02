// Third-party libraries
import { queryOptions } from "@tanstack/react-query";

// Ports API
import { checkPortsReachability } from "./ports-api";

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for checking multiple ports reachability
 */
export const checkPortsReachabilityOptions = (
  ports: number[],
  host: string,
  timeout: number = 1000
) =>
  queryOptions({
    queryKey: ["ports", "reachability", host, ports, timeout],
    queryFn: async () => {
      const result = await checkPortsReachability(ports, host, timeout);
      return result;
    },
    enabled: ports.length > 0 && !!host,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 300, // 5 minutes
  });
