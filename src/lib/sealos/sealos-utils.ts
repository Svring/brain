/**
 * Converts URL format from subdomain.sealos.run to dbconn.sealossubdomain.site
 * Example: bja.sealos.run -> dbconn.sealosbja.site
 * @param url - The input URL in format 'subdomain.sealos.run'
 * @returns The converted URL in format 'dbconn.sealossubdomain.site'
 */
export function convertToDbconnUrl(url: string): string {
  // If URL ends with '.io', return it as is
  if (url.endsWith(".io")) {
    return url;
  }

  // Remove protocol if present
  const urlWithoutProtocol = url.replace(/^https?:\/\//, "");

  // Split by dots
  const parts = urlWithoutProtocol.split(".");

  // Check if it matches the expected pattern (subdomain.sealos.run)
  if (parts.length === 3 && parts[1] === "sealos" && parts[2] === "run") {
    const subdomain = parts[0];
    return `dbconn.sealos${subdomain}.site`;
  }

  // Return original if pattern doesn't match
  return url;
}

/**
 * Transforms URL format from subdomain.sealos.run to sealossubdomain.site
 * Example: bja.sealos.run -> sealosbja.site
 * Unlike convertToDbconnUrl, this function preserves the protocol and doesn't add 'dbconn.' prefix
 */
export function transformRegionUrl(url: string): string {
  // If URL ends with 'io', return as is
  if (url.endsWith(".io")) {
    return url;
  }

  // Extract protocol if present
  const protocolMatch = url.match(/^(https?:\/\/)/);
  const protocol = protocolMatch ? protocolMatch[1] : "";
  const urlWithoutProtocol = url.replace(/^https?:\/\//, "");

  // Split by dots
  const parts = urlWithoutProtocol.split(".");

  // Check if it matches the expected pattern (subdomain.sealos.run)
  if (parts.length === 3 && parts[1] === "sealos" && parts[2] === "run") {
    const subdomain = parts[0];
    return `${protocol}sealos${subdomain}.site`;
  }

  // Return original if pattern doesn't match
  return url;
}

/**
 * Transforms a Docker image URL to extract only the image name
 * @param imageUrl - The full Docker image URL (e.g., 'ghcr.io/labring-actions/devbox/cpp-gcc-12.2.0:13aacd8')
 * @returns The extracted image name (e.g., 'cpp-gcc-12.2.0')
 */
import { z } from "zod";
import { formatUnixTimeInLocalTimezone } from "@/lib/date/date-utils";
import { LAUNCHPAD_DEFAULT_ICON } from "@/lib/sealos/resources/launchpad/launchpad-constant/launchpad-constant-icons";
import { OBJECTSTORAGE_DEFAULT_ICON } from "@/lib/sealos/resources/objectstorage/objectstorage-constant/objectstorage-constant-icons";
import { DEVBOX_DEFAULT_ICON } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-icons";
import { CLUSTER_DEFAULT_ICON } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";

/**
 * Helper function to create a Zod union schema from an array of numbers
 * @param options - Array of number literals to create union from
 * @returns Zod union schema
 */
export const createNumberUnionSchema = <T extends readonly number[]>(
  options: T
) => z.union(options.map((value) => z.literal(value)) as any);

export function truncateImage(imageUrl: string): string {
  // Split by '/' to get the last part which contains the image name and tag
  const parts = imageUrl.split("/");
  const imageWithTag = parts[parts.length - 1];

  // Split by ':' to remove the tag and get only the image name
  const imageName = imageWithTag.split(":")[0];

  return imageName;
}

/**
 * Transforms combined monitor data into a more usable format
 * @param monitorData - The combined monitor data from API responses
 * @returns Transformed data with timepoint-value pairs
 */
export function transformCombinedMonitorData(monitorData: {
  cpu: any;
  memory: any;
  storage?: any;
}) {
  // Handle simple format (devbox/launchpad)
  const simpleCpuData = monitorData.cpu?.data?.[0];
  const simpleMemoryData = monitorData.memory?.data?.[0];
  if (
    (simpleCpuData?.xData && simpleCpuData?.yData) ||
    (simpleMemoryData?.xData && simpleMemoryData?.yData)
  ) {
    const xSeries = simpleCpuData?.xData ?? simpleMemoryData?.xData ?? [];
    return xSeries.map((timestamp: number, index: number) => ({
      timestamp,
      readableTime: formatUnixTimeInLocalTimezone(
        timestamp,
        "yyyy/MM/dd HH:mm"
      ),
      cpu: simpleCpuData?.yData?.[index]
        ? parseFloat(simpleCpuData.yData[index]) || 0
        : 0,
      memory: simpleMemoryData?.yData?.[index]
        ? parseFloat(simpleMemoryData.yData[index]) || 0
        : 0,
    }));
  }

  // Handle complex format (cluster)
  const cpuResult = monitorData.cpu?.data?.result;
  const memoryResult = monitorData.memory?.data?.result;
  const diskResult = monitorData.storage?.data?.result;

  // Find the first result with valid data to get timestamps
  const validResult = cpuResult || memoryResult || diskResult;

  if (validResult?.xData && validResult?.yData) {
    const result: Record<
      string,
      Array<{
        timestamp: number;
        readableTime: string;
        cpu: number;
        memory: number;
        storage?: number;
      }>
    > = {};

    // Process CPU data if available
    if (cpuResult?.yData && cpuResult.yData.length > 0) {
      cpuResult.yData.forEach((podData: { name: string; data: number[] }) => {
        const podName = podData.name;
        const memoryPodData = memoryResult?.yData?.find(
          (m: any) => m.name === podName
        );
        const diskPodData = diskResult?.yData?.find(
          (d: any) => d.name === podName || d.name === `data-${podName}`
        );

        result[podName] = cpuResult.xData.map(
          (timestamp: number, index: number) => ({
            timestamp,
            readableTime: formatUnixTimeInLocalTimezone(
              timestamp,
              "yyyy/MM/dd HH:mm"
            ),
            cpu: podData.data[index] || 0,
            memory: memoryPodData?.data?.[index] || 0,
            storage: diskPodData?.data?.[index] || 0,
          })
        );
      });
    }

    // Process memory data if available (and not already processed with CPU)
    if (
      memoryResult?.yData &&
      memoryResult.yData.length > 0 &&
      (!cpuResult?.yData || cpuResult.yData.length === 0)
    ) {
      memoryResult.yData.forEach(
        (podData: { name: string; data: number[] }) => {
          const podName = podData.name;
          const diskPodData = diskResult?.yData?.find(
            (d: any) => d.name === podName || d.name === `data-${podName}`
          );

          result[podName] = memoryResult.xData.map(
            (timestamp: number, index: number) => ({
              timestamp,
              readableTime: formatUnixTimeInLocalTimezone(
                timestamp,
                "yyyy/MM/dd HH:mm"
              ),
              cpu: 0, // No CPU data available
              memory: podData.data[index] || 0,
              storage: diskPodData?.data?.[index] || 0,
            })
          );
        }
      );
    }

    // Process disk data if available (and not already processed with CPU or memory)
    if (
      diskResult?.yData &&
      diskResult.yData.length > 0 &&
      (!cpuResult?.yData || cpuResult.yData.length === 0) &&
      (!memoryResult?.yData || memoryResult.yData.length === 0)
    ) {
      diskResult.yData.forEach((podData: { name: string; data: number[] }) => {
        const podName = podData.name;

        result[podName] = diskResult.xData.map(
          (timestamp: number, index: number) => ({
            timestamp,
            readableTime: formatUnixTimeInLocalTimezone(
              timestamp,
              "yyyy/MM/dd HH:mm"
            ),
            cpu: 0, // No CPU data available
            memory: 0, // No memory data available
            storage: podData.data[index] || 0,
          })
        );
      });
    }

    return result;
  }

  // Return empty array instead of null when no data is available
  return [];
}

/**
 * Gets the default icon URL for a given resource type
 * @param resourceType - The type of resource (e.g., 'deployment', 'devbox', 'cluster', etc.)
 * @returns The default icon URL for the resource type, or null if not found
 */
export function getResourceDefaultIcon(resourceType: string): string | null {
  switch (resourceType) {
    case "deployment":
    case "statefulset":
      return LAUNCHPAD_DEFAULT_ICON;
    case "objectstoragebucket":
      return OBJECTSTORAGE_DEFAULT_ICON;
    case "devbox":
      return DEVBOX_DEFAULT_ICON;
    case "cluster":
      return CLUSTER_DEFAULT_ICON;
    default:
      return null;
  }
}
