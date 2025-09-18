"use client";

import { queryOptions } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import { getLaunchPadMetrics } from "../metrics-api/launchpad-metrics-api-query";
import type { MetricsApiContext } from "../schemas/metrics-api-context-schema";
import type {
  GetLaunchPadMetricsRequest,
  GetLaunchPadMetricsResponse,
} from "../schemas/metrics-query-schema";

// ============================================================================
// CORE QUERY FUNCTIONS
// ============================================================================

/**
 * Get LaunchPad metrics (CPU, memory usage)
 */
export const getLaunchPadMetricsData = async (
  context: MetricsApiContext,
  request: GetLaunchPadMetricsRequest
): Promise<GetLaunchPadMetricsResponse> => {
  const metricsData = await runParallelAction(
    getLaunchPadMetrics(request, context)
  );
  return metricsData;
};

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for getting LaunchPad metrics
 */
export const getLaunchPadMetricsOptions = (
  context: MetricsApiContext,
  request: GetLaunchPadMetricsRequest
) =>
  queryOptions({
    queryKey: [
      "metrics",
      "launchpad",
      request.namespace,
      request.launchPadName,
      request.type,
      request.start,
      request.end,
      request.time,
    ],
    queryFn: () => getLaunchPadMetricsData(context, request),
    enabled:
      !!context.baseURL &&
      !!request.namespace &&
      !!request.launchPadName &&
      !!request.type,
    // 30 seconds
  });
