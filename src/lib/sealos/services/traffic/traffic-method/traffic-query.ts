"use client";

import { queryOptions } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import { getPodTraffic } from "../traffic-api/traffic-api-query";
import type { TrafficApiContext } from "../schemas/traffic-api-context-schema";
import type {
  GetPodTrafficRequest,
  GetPodTrafficResponse,
} from "../schemas/traffic-flow-schema";

// ============================================================================
// CORE QUERY FUNCTIONS
// ============================================================================

/**
 * Get pod traffic flows
 */
export const getTraffic = async (
  context: TrafficApiContext,
  request: GetPodTrafficRequest
): Promise<GetPodTrafficResponse> => {
  const trafficData = await runParallelAction(getPodTraffic(request, context));
  return trafficData;
};

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for getting pod traffic flows
 */
export const getTrafficOptions = (
  context: TrafficApiContext,
  request: GetPodTrafficRequest
) =>
  queryOptions({
    queryKey: ["hubble", "traffic", "pod", request.crNames],
    queryFn: () => getTraffic(context, request),
    enabled: !!context.baseURL && !!request.crNames?.length,
    staleTime: 1000 * 30, // 30 seconds
  });
