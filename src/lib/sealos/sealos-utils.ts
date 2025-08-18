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
import { formatUnixTimeInLocalTimezone } from "@/lib/date/date-utils";

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
  if (monitorData.cpu?.data?.result) {
    const cpuResult = monitorData.cpu.data.result;
    const memoryResult = monitorData.memory?.data?.result;
    const diskResult = monitorData.storage?.data?.result;

    if (cpuResult?.xData && cpuResult?.yData) {
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

      return result;
    }
  }

  return null;
}

/**
 * Infers the appropriate color class based on a status string
 * @param status - The status string to evaluate
 * @param type - The type of color to return ('text', 'bg', or 'border')
 * @returns The appropriate color class string
 */
export function inferStatusColor(
  status: string,
  type: "text" | "bg" | "border" = "text"
): string {
  const normalizedStatus = status.toLowerCase();

  // Define status to color mappings
  const statusColorMap: Record<string, string> = {
    running: "theme-green",
    ready: "theme-green",
    active: "theme-green",
    healthy: "theme-green",
    success: "theme-green",

    error: "theme-red",
    failed: "theme-red",
    terminated: "theme-red",
    crashloopbackoff: "theme-red",
    unhealthy: "theme-red",

    pending: "theme-gray",
    waiting: "theme-gray",
    unknown: "theme-gray",
    stopped: "theme-gray",
    shutdown: "theme-gray",
    deleting: "theme-gray",

    warning: "theme-yellow",
    imagepullbackoff: "theme-yellow",
    containercreating: "theme-yellow",
    podinitializing: "theme-yellow",
  };

  // Get the base color
  const baseColor = statusColorMap[normalizedStatus] || "theme-gray";

  // Return the appropriate color class based on type
  switch (type) {
    case "text":
      return `text-${baseColor}`;
    case "bg":
      return `bg-${baseColor}`;
    case "border":
      return `border-${baseColor}`;
    default:
      return `text-${baseColor}`;
  }
}
