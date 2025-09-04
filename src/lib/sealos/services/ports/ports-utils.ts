// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Port object interface for container port extraction
 */
interface PortObject {
  number: number;
  privateAddress?: string;
  [key: string]: any;
}

/**
 * Result interface for container port extraction
 */
export interface ContainerPortsResult {
  host: string | null;
  ports: number[];
}

/**
 * Extract host and port numbers from a ports array for container status checking
 * @param ports - Array of port objects with number and privateAddress properties
 * @returns Object containing the extracted host and port numbers
 */
export function extractContainerPorts(
  ports: PortObject[] | undefined
): ContainerPortsResult {
  if (!ports || ports.length === 0) {
    return { host: null, ports: [] };
  }

  // Extract host from the first port's privateAddress
  const firstPort = ports[0];
  let host: string | null = null;

  if (firstPort.privateAddress) {
    // Extract host from privateAddress (e.g., "tcp://affine-wljjwbhe.ns-gapyo0ig:3010" -> "affine-wljjwbhe.ns-gapyo0ig")
    const match = firstPort.privateAddress.match(/tcp:\/\/([^:]+):/);
    host = match ? match[1] : null;
  }

  // Extract port numbers from all ports
  const portNumbers = ports
    .map((port) => port.number)
    .filter(
      (number): number is number => typeof number === "number" && !isNaN(number)
    );

  return { host, ports: portNumbers };
}
