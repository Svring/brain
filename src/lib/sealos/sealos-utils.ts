import { z } from "zod";
import axios from "axios";
import https from "https";
import { formatUnixTimeInLocalTimezone } from "@/lib/date/date-utils";
import { LAUNCHPAD_DEFAULT_ICON } from "@/lib/sealos/resources/launchpad/launchpad-constant/launchpad-constant-icons";
import { OBJECTSTORAGE_DEFAULT_ICON } from "@/lib/sealos/resources/objectstorage/objectstorage-constant/objectstorage-constant-icons";
import { DEVBOX_DEFAULT_ICON } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-icons";
import { CLUSTER_DEFAULT_ICON } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";

// ============================================================================
// URL TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Converts URL format from subdomain.sealos.run to dbconn.sealossubdomain.site
 * @example bja.sealos.run -> dbconn.sealosbja.site
 */
export function convertToDbconnUrl(url: string): string {
  if (url.endsWith(".io")) return url;

  const urlWithoutProtocol = url.replace(/^https?:\/\//, "");
  const parts = urlWithoutProtocol.split(".");

  if (parts.length === 3 && parts[1] === "sealos" && parts[2] === "run") {
    return `dbconn.sealos${parts[0]}.site`;
  }

  return url;
}

/**
 * Transforms URL format from subdomain.sealos.run to sealossubdomain.site
 * Preserves protocol and doesn't add 'dbconn.' prefix
 * @example bja.sealos.run -> sealosbja.site
 */
export function transformRegionUrl(url: string): string {
  if (url.endsWith(".io")) return url;

  const protocolMatch = url.match(/^(https?:\/\/)/);
  const protocol = protocolMatch?.[1] ?? "";
  const urlWithoutProtocol = url.replace(/^https?:\/\//, "");
  const parts = urlWithoutProtocol.split(".");

  if (parts.length === 3 && parts[1] === "sealos" && parts[2] === "run") {
    return `${protocol}sealos${parts[0]}.site`;
  }

  return url;
}

/**
 * Extracts image name from Docker image URL
 * @example 'ghcr.io/labring-actions/devbox/cpp-gcc-12.2.0:13aacd8' -> 'cpp-gcc-12.2.0:13aacd8'
 */
export function truncateImage(imageUrl: string): string {
  return imageUrl.split("/").pop() ?? imageUrl;
}

// ============================================================================
// ZOD UTILITIES
// ============================================================================

/**
 * Creates a Zod union schema from an array of number literals
 */
export const createNumberUnionSchema = <T extends readonly number[]>(
  options: T
) => z.union(options.map((value) => z.literal(value)) as any);

// ============================================================================
// MONITOR DATA TRANSFORMATION
// ============================================================================

type MonitorDataPoint = {
  timestamp: number;
  readableTime: string;
  cpu: number;
  memory: number;
  storage?: number;
};

type MonitorData = {
  cpu: any;
  memory: any;
  storage?: any;
};

/**
 * Transforms combined monitor data into a more usable format
 * Handles both simple (devbox/launchpad) and complex (cluster) data formats
 */
export function transformCombinedMonitorData(
  monitorData: MonitorData
): MonitorDataPoint[] | Record<string, MonitorDataPoint[]> {
  // Handle simple format (devbox/launchpad)
  const simpleCpuData = monitorData.cpu?.data?.[0];
  const simpleMemoryData = monitorData.memory?.data?.[0];

  if (simpleCpuData?.xData || simpleMemoryData?.xData) {
    const xSeries = simpleCpuData?.xData ?? simpleMemoryData?.xData ?? [];
    return xSeries.map((timestamp: number, index: number) => ({
      timestamp,
      readableTime: formatUnixTimeInLocalTimezone(
        timestamp,
        "yyyy/MM/dd HH:mm"
      ),
      cpu: parseFloat(simpleCpuData?.yData?.[index]) || 0,
      memory: parseFloat(simpleMemoryData?.yData?.[index]) || 0,
    }));
  }

  // Handle complex format (cluster)
  return transformClusterMonitorData(monitorData);
}

/**
 * Transforms cluster monitor data with pod-level granularity
 */
function transformClusterMonitorData(
  monitorData: MonitorData
): Record<string, MonitorDataPoint[]> {
  const cpuResult = monitorData.cpu?.data?.result;
  const memoryResult = monitorData.memory?.data?.result;
  const diskResult = monitorData.storage?.data?.result;

  const validResult = cpuResult || memoryResult || diskResult;
  if (!validResult?.xData) return {};

  const result: Record<string, MonitorDataPoint[]> = {};

  // Process CPU data (primary)
  if (cpuResult?.yData?.length) {
    cpuResult.yData.forEach((podData: { name: string; data: number[] }) => {
      result[podData.name] = createPodDataPoints(
        cpuResult.xData,
        podData.data,
        findPodData(memoryResult?.yData, podData.name),
        findPodData(diskResult?.yData, podData.name, `data-${podData.name}`)
      );
    });
    return result;
  }

  // Process memory data (fallback)
  if (memoryResult?.yData?.length) {
    memoryResult.yData.forEach((podData: { name: string; data: number[] }) => {
      result[podData.name] = createPodDataPoints(
        memoryResult.xData,
        new Array(memoryResult.xData.length).fill(0), // No CPU data
        podData.data,
        findPodData(diskResult?.yData, podData.name, `data-${podData.name}`)
      );
    });
    return result;
  }

  // Process disk data (last resort)
  if (diskResult?.yData?.length) {
    diskResult.yData.forEach((podData: { name: string; data: number[] }) => {
      result[podData.name] = createPodDataPoints(
        diskResult.xData,
        new Array(diskResult.xData.length).fill(0), // No CPU data
        new Array(diskResult.xData.length).fill(0), // No memory data
        podData.data
      );
    });
  }

  return result;
}

/**
 * Helper function to find pod data by name
 */
function findPodData(
  dataArray: any[] | undefined,
  name: string,
  altName?: string
) {
  return dataArray?.find(
    (item: any) => item.name === name || item.name === altName
  )?.data;
}

/**
 * Creates data points for a pod with all metrics
 */
function createPodDataPoints(
  timestamps: number[],
  cpuData: number[],
  memoryData: number[] | undefined,
  storageData: number[] | undefined
): MonitorDataPoint[] {
  return timestamps.map((timestamp, index) => ({
    timestamp,
    readableTime: formatUnixTimeInLocalTimezone(timestamp, "yyyy/MM/dd HH:mm"),
    cpu: cpuData[index] || 0,
    memory: memoryData?.[index] || 0,
    storage: storageData?.[index] || 0,
  }));
}

// ============================================================================
// RESOURCE UTILITIES
// ============================================================================

/**
 * Gets the default icon URL for a given resource type
 */
export function getResourceDefaultIcon(resourceType: string): string | null {
  const iconMap: Record<string, string> = {
    deployment: LAUNCHPAD_DEFAULT_ICON,
    statefulset: LAUNCHPAD_DEFAULT_ICON,
    objectstoragebucket: OBJECTSTORAGE_DEFAULT_ICON,
    devbox: DEVBOX_DEFAULT_ICON,
    cluster: CLUSTER_DEFAULT_ICON,
  };

  return iconMap[resourceType] ?? null;
}

// ============================================================================
// API UTILITIES
// ============================================================================

type ServiceType =
  | "devbox"
  | "cluster"
  | "launchpad"
  | "objectstorage"
  | "template";

const SERVICE_URL_TEMPLATES: Record<ServiceType, string> = {
  devbox: "devbox",
  cluster: "dbprovider",
  launchpad: "launchpad",
  objectstorage: "objectstorage",
  template: "template",
};

/**
 * Creates an HTTPS agent with appropriate settings for development/production
 */
export function createHttpsAgent(): https.Agent {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return new https.Agent({
    keepAlive: true,
    rejectUnauthorized: !isDevelopment,
  });
}

/**
 * Universal API creation utility for Sealos services
 */
export function createSealosApi(
  context: SealosApiContext,
  serviceType: ServiceType,
  apiVersion?: string
) {
  const serviceSubdomain = SERVICE_URL_TEMPLATES[serviceType];
  const baseURL = `http://${serviceSubdomain}.${context.baseUrl}/api${
    apiVersion ? `/${apiVersion}` : ""
  }`;

  // console.log("baseURL", baseURL);

  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...(context.authorization && { Authorization: context.authorization }),
    },
    httpsAgent: createHttpsAgent(),
  });
}
