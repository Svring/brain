// Third-party libraries
import { useQuery } from "@tanstack/react-query";

// Ports query options
import { checkPortsReachabilityOptions } from "@/lib/sealos/services/ports/ports-query";

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to check the reachability status of multiple ports on a host
 * @param ports - Array of port numbers to check
 * @param host - The host to check (domain or IP address)
 * @param timeout - Timeout in milliseconds (default: 1000)
 * @returns Query result with port status information
 */
export function useContainerStatus(
  ports: number[],
  host: string,
  timeout: number = 1000
) {
  return useQuery(checkPortsReachabilityOptions(ports, host, timeout));
}
