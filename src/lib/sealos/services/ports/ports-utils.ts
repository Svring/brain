// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Port object interface for container port extraction
 */
interface PortObject {
  number: number;
  privateAddress?: string;
  privateHost?: string;
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
 * @param ports - Array of port objects with number and privateHost properties
 * @returns Object containing the extracted host and port numbers
 */
export function extractContainerPorts(
  ports: PortObject[] | undefined
): ContainerPortsResult {
  if (!ports || ports.length === 0) {
    return { host: null, ports: [] };
  }

  // Get host from the first port's privateHost field
  const host = ports[0]?.privateHost || null;

  // Extract port numbers from all ports
  const portNumbers = ports
    .map((port) => port.number)
    .filter(
      (number): number is number => typeof number === "number" && !isNaN(number)
    );

  return { host, ports: portNumbers };
}
