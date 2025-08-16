import type { GetLaunchPadMetricsResponse } from "./schemas/metrics-query-schema";
import { formatUnixTimeInLocalTimezone } from "@/lib/date/date-utils";

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
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const halfHourAgo = new Date(now.getTime() - 30 * 60 * 1000);

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
