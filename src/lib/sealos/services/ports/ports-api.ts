"use server";

import isPortReachable from "is-port-reachable";

/**
 * Check if a port on a host is reachable
 * @param port - The port number to check
 * @param host - The host to check (domain or IP address)
 * @param timeout - Timeout in milliseconds (default: 1000)
 * @returns Promise<boolean> - Whether the port is reachable
 */
export async function checkPortReachability(
  port: number,
  host: string,
  timeout: number = 1000
): Promise<boolean> {
  try {
    return await isPortReachable(port, { host, timeout });
  } catch (error) {
    console.error(`Error checking port ${port} on ${host}:`, error);
    return false;
  }
}

/**
 * Check if multiple ports on a host are reachable
 * @param ports - Array of port numbers to check
 * @param host - The host to check (domain or IP address)
 * @param timeout - Timeout in milliseconds (default: 1000)
 * @returns Promise<Array<{port: number, reachable: boolean}>> - Results for each port
 */
export async function checkPortsReachability(
  ports: number[],
  host: string,
  timeout: number = 1000
): Promise<Array<{ port: number; reachable: boolean }>> {
  const results = await Promise.all(
    ports.map(async (port) => ({
      port,
      reachable: await checkPortReachability(port, host, timeout),
    }))
  );
  // console.log("results", results);

  return results;
}
