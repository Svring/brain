"use client";

import { queryOptions } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import { getClusterMetrics } from "../metrics-api/cluster-metrics-api-query";
import type { MetricsApiContext } from "../schemas/metrics-api-context-schema";
import type {
  GetClusterMetricsRequest,
  GetClusterMetricsResponse,
} from "../schemas/cluster-metrics-schema";

// ============================================================================
// CORE QUERY FUNCTIONS
// ============================================================================

/**
 * Get cluster metrics (database metrics like MySQL, PostgreSQL, etc.)
 */
export const getClusterMetricsData = async (
  context: MetricsApiContext,
  request: GetClusterMetricsRequest
): Promise<GetClusterMetricsResponse> => {
  const metricsData = await runParallelAction(
    getClusterMetrics(request, context)
  );
  return metricsData;
};

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for getting cluster metrics
 */
export const getClusterMetricsOptions = (
  context: MetricsApiContext,
  request: GetClusterMetricsRequest
) =>
  queryOptions({
    queryKey: [
      "metrics",
      "cluster",
      request.namespace,
      request.app,
      request.type,
      request.query,
      request.start,
      request.end,
      request.time,
    ],
    queryFn: () => getClusterMetricsData(context, request),
    enabled:
      !!context.baseUrl &&
      !!request.namespace &&
      !!request.app &&
      (!!request.type || !!request.query), // Must have either type or query
    // 30 seconds
  });
