"use client";

import { queryOptions } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import { getPodTraffic } from "./traffic-api/traffic-api-query";
import type { TrafficApiContext } from "./schemas/traffic-api-context-schema";
import type { GetPodTrafficRequest } from "./schemas/traffic-flow-schema";

export const getPodTrafficOptions = (
  context: TrafficApiContext,
  request: GetPodTrafficRequest
) =>
  queryOptions({
    queryKey: ["hubble", "traffic", "pod", request.namespace, request.pod],
    queryFn: () => runParallelAction(getPodTraffic(request, context)),
    enabled: !!context.namespace && !!request.namespace && !!request.pod,
  });
