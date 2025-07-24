"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import { TrafficApiContext } from "../schemas/traffic-api-context-schema";
import {
  GetPodTrafficRequestSchema,
  GetPodTrafficResponseSchema,
  GetPodTrafficRequest,
  GetPodTrafficResponse,
} from "../schemas/traffic-flow-schema";
import https from "https";

function createTrafficApi(context: TrafficApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return axios.create({
    baseURL: context.baseURL,
    httpsAgent: isDevelopment
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined,
  });
}

export const getPodTraffic = createParallelAction(
  async (
    request: GetPodTrafficRequest,
    context: TrafficApiContext
  ): Promise<GetPodTrafficResponse> => {
    const validatedRequest = GetPodTrafficRequestSchema.parse(request);
    const api = createTrafficApi(context);
    const response = await api.get("/api/flow", {
      params: validatedRequest,
    });
    return GetPodTrafficResponseSchema.parse(response.data);
  }
);
