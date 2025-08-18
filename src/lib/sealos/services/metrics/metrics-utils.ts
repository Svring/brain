import type { GetLaunchPadMetricsResponse } from "./schemas/metrics-query-schema";
import {
  formatUnixTimeInLocalTimezone,
  formatIsoDateToReadable,
} from "@/lib/date/date-utils";

/**
 * Extract monitoring data organized by pod from metrics response
 * Works with both instant and range queries for CPU and memory metrics
 */
export const extractPodMetricsData = (response: {
  cpu: GetLaunchPadMetricsResponse;
  memory: GetLaunchPadMetricsResponse;
}): Record<
  string,
  {
    cpu: Array<[string, string]>; // [formatted_time, value]
    memory: Array<[string, string]>; // [formatted_time, value]
  }
> => {
  const result: Record<
    string,
    {
      cpu: Array<[string, string]>;
      memory: Array<[string, string]>;
    }
  > = {};

  // Extract CPU metrics by pod
  if (response.cpu?.data?.result) {
    response.cpu.data.result.forEach((item) => {
      const podName = item.metric?.pod;
      if (podName) {
        if (!result[podName]) {
          result[podName] = { cpu: [], memory: [] };
        }

        if (item.values && Array.isArray(item.values)) {
          // Range query result - convert timestamps to local timezone
          result[podName].cpu = item.values.map(([timestamp, value]) => [
            formatUnixTimeInLocalTimezone(timestamp),
            value,
          ]) as Array<[string, string]>;
        } else if (item.value && Array.isArray(item.value)) {
          // Instant query result - convert timestamp to local timezone
          result[podName].cpu = [
            [formatUnixTimeInLocalTimezone(item.value[0]), item.value[1]],
          ] as Array<[string, string]>;
        }
      }
    });
  }

  // Extract memory metrics by pod
  if (response.memory?.data?.result) {
    response.memory.data.result.forEach((item) => {
      const podName = item.metric?.pod;
      if (podName) {
        if (!result[podName]) {
          result[podName] = { cpu: [], memory: [] };
        }

        if (item.values && Array.isArray(item.values)) {
          // Range query result - convert timestamps to local timezone
          result[podName].memory = item.values.map(([timestamp, value]) => [
            formatUnixTimeInLocalTimezone(timestamp),
            value,
          ]) as Array<[string, string]>;
        } else if (item.value && Array.isArray(item.value)) {
          // Instant query result - convert timestamp to local timezone
          result[podName].memory = [
            [formatUnixTimeInLocalTimezone(item.value[0]), item.value[1]],
          ] as Array<[string, string]>;
        }
      }
    });
  }

  // If no pods were found, create a dummy pod with empty data
  if (Object.keys(result).length === 0) {
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    result["dummy-pod"] = {
      cpu: [
        [
          threeHoursAgo.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
        [
          twoHoursAgo.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
        [
          oneHourAgo.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
        [
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
      ],
      memory: [
        [
          threeHoursAgo.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
        [
          twoHoursAgo.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
        [
          oneHourAgo.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
        [
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
      ],
    };
  }

  return result;
};

import type { GetClusterMetricsResponse } from "./schemas/cluster-metrics-schema";

/**
 * Extract monitoring data organized by pod from cluster metrics response
 * Works with both instant and range queries for CPU, memory, and storage metrics
 */
export const extractClusterMetricsData = (response: {
  cpu: GetClusterMetricsResponse;
  memory: GetClusterMetricsResponse;
  storage?: GetClusterMetricsResponse;
}): Record<
  string,
  {
    cpu: Array<[string, string]>; // [formatted_time, value]
    memory: Array<[string, string]>; // [formatted_time, value]
    storage?: Array<[string, string]>; // [formatted_time, value]
  }
> => {
  const result: Record<
    string,
    {
      cpu: Array<[string, string]>;
      memory: Array<[string, string]>;
      storage?: Array<[string, string]>;
    }
  > = {};

  // Extract CPU metrics by pod
  if (response.cpu?.data?.result) {
    response.cpu.data.result.forEach((item) => {
      const podName = item.metric?.pod || "cluster";
      if (!result[podName]) {
        result[podName] = { cpu: [], memory: [] };
      }

      if (item.values && Array.isArray(item.values)) {
        // Range query result - convert timestamps to local timezone
        result[podName].cpu = item.values.map(([timestamp, value]) => [
          formatUnixTimeInLocalTimezone(timestamp),
          value,
        ]) as Array<[string, string]>;
      } else if (item.value && Array.isArray(item.value)) {
        // Instant query result - convert timestamp to local timezone
        result[podName].cpu = [
          [formatUnixTimeInLocalTimezone(item.value[0]), item.value[1]],
        ] as Array<[string, string]>;
      }
    });
  }

  // Extract memory metrics by pod
  if (response.memory?.data?.result) {
    response.memory.data.result.forEach((item) => {
      const podName = item.metric?.pod || "cluster";
      if (!result[podName]) {
        result[podName] = { cpu: [], memory: [] };
      }

      if (item.values && Array.isArray(item.values)) {
        // Range query result - convert timestamps to local timezone
        result[podName].memory = item.values.map(([timestamp, value]) => [
          formatUnixTimeInLocalTimezone(timestamp),
          value,
        ]) as Array<[string, string]>;
      } else if (item.value && Array.isArray(item.value)) {
        // Instant query result - convert timestamp to local timezone
        result[podName].memory = [
          [formatUnixTimeInLocalTimezone(item.value[0]), item.value[1]],
        ] as Array<[string, string]>;
      }
    });
  }

  // Extract storage metrics by pod
  if (response.storage?.data?.result) {
    response.storage.data.result.forEach((item) => {
      // Storage metrics use persistentvolumeclaim instead of pod
      // The PVC name has format "data-{podName}", so we need to extract the pod name
      const pvcName = item.metric?.persistentvolumeclaim;
      let podName = "cluster"; // default fallback

      if (pvcName && pvcName.startsWith("data-")) {
        // Extract pod name from PVC name: "data-teable-xezvlqtc-pg-postgresql-0" -> "teable-xezvlqtc-pg-postgresql-0"
        podName = pvcName.substring(5); // remove "data-" prefix
      }

      if (!result[podName]) {
        result[podName] = { cpu: [], memory: [] };
      }

      if (item.values && Array.isArray(item.values)) {
        // Range query result - convert timestamps to local timezone
        result[podName].storage = item.values.map(([timestamp, value]) => [
          formatUnixTimeInLocalTimezone(timestamp),
          value,
        ]) as Array<[string, string]>;
      } else if (item.value && Array.isArray(item.value)) {
        // Instant query result - convert timestamp to local timezone
        result[podName].storage = [
          [formatUnixTimeInLocalTimezone(item.value[0]), item.value[1]],
        ] as Array<[string, string]>;
      }
    });
  }

  // If no data was found, create a dummy entry
  if (Object.keys(result).length === 0) {
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    result["cluster"] = {
      cpu: [
        [
          threeHoursAgo.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
        [
          twoHoursAgo.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
        [
          oneHourAgo.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
        [
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
      ],
      memory: [
        [
          threeHoursAgo.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
        [
          twoHoursAgo.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
        [
          oneHourAgo.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
        [
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          "0",
        ],
      ],
    };
  }

  return result;
};

/**
 * Convert formatted time in metrics data to more readable format
 * Takes data in the shape of [formatted_time, value] and converts the time to a more readable format
 * @param data - Array of [formatted_time, value] tuples
 * @param formatString - Date format string (default: 'HH:mm')
 * @returns Array of [readable_time, value] tuples
 */
export const convertMetricsTimeToReadable = (
  data: Array<[string, string]>,
  formatString: string = "HH:mm"
): Array<[string, string]> => {
  return data.map(([formattedTime, value]) => [
    formatIsoDateToReadable(formattedTime, formatString),
    value,
  ]);
};

/**
 * Filter monitor data to only include pods that start with the specified name
 * @param monitorData - Monitor data object with pod names as keys
 * @param podNamePrefix - The prefix to filter by (e.g., devbox name)
 * @returns Filtered monitor data object
 */
export const filterExternalPods = <T extends Record<string, any>>(
  monitorData: T | undefined,
  podNamePrefix: string
): T | undefined => {
  if (!monitorData) return undefined;

  return Object.fromEntries(
    Object.entries(monitorData).filter(([podName]) =>
      podName.startsWith(podNamePrefix)
    )
  ) as T;
};
